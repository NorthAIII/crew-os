# Bunker OS v3 — Proje Spec'i (onay için)

> **Amaç:** Bu doküman, yeni pencerede **36337/DevFlow** "New Project" akışına girdi olacak
> framework-bağımsız spec'tir. Onaylanınca DevFlow süreci bunu PSA/epic/story'lere açar.
> **Durum:** ONAY BEKLİYOR.
> **Dayanak:** `kiwi-ai-lab/docs/SISTEM-ANALIZI-RAPORU.md` (tam sistem analizi) + onaylı mimari plan.

---

## 1. Bağlam & Problem

Mevcut Bunker OS iki nesil yan yana yaşıyor (n8n v1 + crew-os v2); sabah brifing/komuta mantığı 3 yerde
tekrarlanıyor; deploy versiyon kontrolü dışında; repo↔prod drift var; git'e commit'li sır + auth'suz
dashboard API'leri mevcut; workflow'ların çoğu `CONFIGURE_ME` STUB. Hedef: **çok daha sade, AI-ajan ile
kolay/esnek geliştirilebilen, hafif** bir sistem; sıfırdan temiz kur, dogfood'da kanıtla, Hetzner'i
cutover et.

## 2. Karar: Yön B — tek TypeScript app + worker

n8n tamamen emekli; her şey kodda. Çalışma-zamanı stack'i **sadece**: `Next.js app + node worker +
Postgres`. (n8n YOK, Redis YOK, Qdrant YOK, Adminer YOK, yerel embedding modeli YOK.) Hetzner footprint'i
belirgin düşer.

### 2.1 LLM — tek sağlayıcı Anthropic (Groq/Qwen/Llama + Gemini kaldırıldı)
| İş | Model |
|---|---|
| Scout, Critic, reply sınıflama, routing | **Haiku** |
| Strategist, Conductor (brifing), içerik, Reflexion | **Sonnet** |

Token verimliliği = **Haiku + prompt caching** (statik system prompt'ları cache'lenir). Qwen'in eski
"token verimliliği" gerekçesi böyle, ikinci sağlayıcısız karşılanır. (Not: Qwen/Llama Groq API'siydi,
disk yemiyordu sanılan şey aslında crew-os imajındaki **fastembed yerel modeli + Qdrant**'tı; ikisi de
kaldırıldı.)

### 2.2 KB — Qdrant yerine Postgres full-text
KB minik (5 doküman / 43 chunk). Chunk'lar `kb_chunks` tablosunda, `to_tsvector('simple', text)` GIN
index ile aranır; ya da doğrudan prompt'a (cache'li) enjekte edilir. Büyüme yolu: pgvector + Voyage
(hosted embedding, yerel model yok).

## 3. Multi-tenant & white-label (gün-1)
- Her iş tablosunda `tenant_id`. Tüm kiwi-sabitleri (marka, sender email, Cal.com linki, Slack kanalı,
  segment listesi, fiyat/maliyet, hedef pazarlar) **`tenant_config`** tablosunda — koda gömülmez.
- Prompt'lara tenant profil metni enjekte edilir (`buildTenantProfile`) → "KiwiAI Lab/Kivanc/fiyat"
  hiçbir prompt'ta sabit değil. White-label = yeni tenant satırı + config.

## 4. Güvenlik (gün-1)
- Tüm sırlar env'de; repoda asla. (Eski: `index_kb.py` Qdrant key, chat-v3 cleartext DB şifresi, açık
  n8n API key — hepsi rotate + env.)
- Dashboard auth (MVP: imzalı cookie + paylaşılan parola; ilerisi: gerçek kullanıcı/rol). Tüm `/api/*`
  tenant-scoped (eski auth'suz açık endpoint'ler kapanır).

## 5. Tohum (bugün üretildi, DOĞRULANDI: typecheck + drizzle generate geçti)
`/workspaces/bunker` içinde hazır ve taşınacak:
- `src/db/schema.ts` — **14 tablo** multi-tenant şema (tenants, tenant_config, leads, meetings,
  hermes_settings/templates/emails, email_suppression, agent_executions, content_queue, crew_runs/
  decisions/lessons, kb_chunks). Migration `drizzle/0000_*.sql` üretildi.
- `src/db/index.ts` + `migrate.ts` — Postgres (postgres.js) + Drizzle.
- `src/lib/llm/*` — Anthropic tek-sağlayıcı (`complete`, `completeJson`, prompt caching, Haiku/Sonnet).
- `src/lib/tenant/*` — slug→config çözümü + profil enjeksiyonu.
- `package.json`, `tsconfig`, `next.config`, `drizzle.config`, `.env.example`, `docker-compose.yml`
  (app+worker+postgres), `Dockerfile`(+`.worker`).

## 6. Fazlar (DevFlow New Project altında yürür)
- **Faz 1 — Veri & tenant & auth:** migration uygula, `tenant_config` seed (kiwi değerleri), dashboard
  auth, tenant-scoped API'ler.
- **Faz 2 — Hermes (çalışan tek gerçek varlık) koda taşı:** Gmail API ile sequence-sender (4 saatte) +
  reply-handler (Haiku sınıflama, suppression, Cal.com yanıtı). Birim testler. Kaynak:
  `bunker-v2/workflows/hermes-sequence-sender.json` + `hermes-reply-handler.json`.
- **Faz 3 — Brifing beyni:** crew-os pipeline TS portu (Scout→Strategist→Critic→Conductor + Graduated
  Autonomy + Reflexion). n8n crew-athena/orion/director mükerrerleri kalkar.
- **Faz 4 — Yardımcı işler:** apollo-import, lead-gen (SerpAPI), calcom-webhook, social-media,
  ops-monitoring; KB Postgres FTS seed.
- **Faz 5 — Veri taşıma + paralel dogfood:** eski Postgres → yeni şema; eski Hetzner açıkken 1-2 hafta
  paralel doğrula.
- **Faz 6 — Hetzner cutover:** eski stack (n8n+Redis+Qdrant+Adminer) komple kaldır; yeni hafif stack
  devreye; CLAUDE.md yeniden yaz.
- **v2 modülü (sonraya) — Claude Code token monitör:** dashboard'da token kullanımı/maliyet + 5h/haftalık
  pencere. Kaynak: OTEL metrikleri (`CLAUDE_CODE_ENABLE_TELEMETRY=1` → collector). 5h/haftalık abonelik
  limiti public API'de net olmadığından eşik hesabı bizde.

## 7. Dashboard (reuse)
`kiwi-ai-lab/kiwi-website/src/app/bunker/*` + `components/bunker/*` ekranları PROD; auth + tenant-scope
eklenip taşınır (Overview, Leads, Email/Hermes, Activity). Pazarlama sitesi (`kiwi-website`) ayrı repo
kalır (Vercel).

## 8. GitHub (karar: tek org + çoklu repo)
Org `KiwiAILab` (veya NorthAIII). Repolar: `bunker` (bu proje), `kiwi-website` (pazarlama), `reverb`
(SaaS — ayrı repodaki mevcut bunker-dashboard taşınır), `kiwi-ai-lab` (arşiv/referans).

## 9. Açık sorular (build öncesi)
1. **36337/DevFlow private** — erişim için `gh auth login` ya da ORCHESTRATOR.md/README içeriği gerekli;
   yoksa spec framework-bağımsız kalır.
2. **Reverb repo** elde değil → birleşme/paylaşım kararı o repo görülünce.
3. **VPS gerçek specs + sağlayıcı** (Hostinger KVM2 mı Hetzner mı? IP'ler çelişiyor) — cutover öncesi
   `free -h`/`nproc`/`docker stats`.
4. **Gmail OAuth** refresh token akışı (n8n soyutluyordu, artık kodda).
5. **Onay akışı:** e-posta reply mi, dashboard tek-tık mı, ikisi mi?
6. **Model ID teyidi:** Haiku/Sonnet sürüm kimlikleri (`.env` override'lı).

## 10. Kabul kriterleri (Definition of Done)
- `docker compose up` → dashboard login → lead ekle → worker tetikle → Gmail gönder/yanıt sınıfla →
  DB güncellenir.
- `/api/agents/run` → brifing emaili üretir; Graduated Autonomy eşikleri seed veriyle doğrulanır.
- Hiçbir sır repoda; tüm API tenant-scoped + auth'lu.
- Eski ve yeni sistem çıktıları paralel dogfood'da örtüşür → cutover onayı.
