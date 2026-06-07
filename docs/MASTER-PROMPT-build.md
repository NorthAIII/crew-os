# MASTER PROMPT — Bunker OS v3 İnşa (yeni bağlamda çalıştır)

> Yeni bir Claude Code oturumu aç, **çalışma dizini `/workspaces/bunker`** olsun, bu prompt'u yapıştır.

---

Sen Bunker OS v3'ün baş geliştiricisisin. Bu, KiwiAI Lab'in eski iki-nesil sistemini (n8n v1 +
crew-os v2) **tek bir TypeScript uygulamasına** sadeleştiren greenfield bir projedir. Onaylı spec ve
doğrulanmış bir tohum (foundation) zaten diskte hazır — sıfırdan yazma, **üzerine devam et**.

## ZORUNLU İLK ADIMLAR (sırayla)
1. Şu dosyaları oku:
   - `./PROJECT-SPEC.md` — onaylı proje spec'i (TEK kaynak; kararlar burada).
   - `/workspaces/Bunker OS/docs/SISTEM-ANALIZI-RAPORU.md` — eski sistemin tam analizi (referans).
   - `./src/db/schema.ts` — hazır 14-tablo multi-tenant şema.
2. DevFlow'u doğrula: `./DevFlow/` var mı? Yoksa kullanıcıdan klonlamasını iste
   (`git clone https://github.com/36337/DevFlow.git DevFlow` — private, kullanıcı auth'u gerekir).
   `./CLAUDE.md` içinde `Read and follow: ./DevFlow/ORCHESTRATOR.md` satırı yoksa ekle.
3. **DevFlow'u tam uygula:** `./DevFlow/ORCHESTRATOR.md`'yi oku ve **New Project** workflow'unu başlat;
   `PROJECT-SPEC.md`'yi spec/PSA girdisi olarak kullan. DevFlow'un faz/gate/ajan disiplinine uy.

## DEĞİŞMEZ KARARLAR (yeniden tartışma — spec'te kilitli)
- **Yön B:** tek Next.js app + node worker + Postgres. **n8n YOK, Redis YOK, Qdrant YOK, yerel embedding YOK.**
- **Tek LLM sağlayıcı = Anthropic.** Haiku (Scout/Critic/sınıflama/routing), Sonnet (Strategist/Conductor/
  içerik/Reflexion). Token verimliliği = Haiku + prompt caching. Groq/Qwen/Llama/Gemini eklenmez.
- **KB = Postgres full-text** (`kb_chunks`, GIN tsvector). Vektör DB yok; büyürse pgvector+Voyage.
- **Multi-tenant gün-1:** her tabloda `tenant_id`; tüm kiwi-sabitleri `tenant_config`'te; prompt'lara
  tenant profili enjekte edilir (`src/lib/tenant`). Hiçbir kiwi-değeri koda gömülmez.
- **Güvenlik gün-1:** tüm sırlar env'de (repoda asla); dashboard auth + tüm `/api/*` tenant-scoped.

## TOHUM DURUMU (DOĞRULANDI — typecheck + drizzle generate geçti; rebuild etme)
Hazır: `src/db/schema.ts` (14 tablo) + `drizzle/0000_*.sql`, `src/db/index.ts`+`migrate.ts`,
`src/lib/llm/*` (Anthropic + completeJson + caching), `src/lib/tenant/*`, `package.json`/`tsconfig`/
`next.config`/`drizzle.config`/`.env.example`/`docker-compose.yml`/`Dockerfile`(+`.worker`).
Hermes ve pipeline iş modülleri (`src/lib/hermes/*`, `src/lib/agents/*`) STUB — doldurulacak.

## NEREDEN BAŞLA (faz sırası — spec §6)
1. **Faz 1:** migration uygula, `tenant_config` seed (kiwi değerleri), dashboard auth, tenant-scoped API.
2. **Faz 2:** Hermes'i Gmail API ile koda taşı (sequence-sender + reply-handler) + birim testler.
   Kaynak davranış: `/workspaces/Bunker OS/bunker-v2/workflows/hermes-sequence-sender.json` +
   `hermes-reply-handler.json`.
3. **Faz 3:** brifing pipeline TS portu (Scout→Strategist→Critic→Conductor + Graduated Autonomy +
   Reflexion). Kaynak: `/workspaces/Bunker OS/bunker-v2/crew-os/app/`.
4. **Faz 4-6:** yardımcı işler + KB FTS seed + veri taşıma + paralel dogfood + Hetzner cutover.

## KURALLAR & GUARDRAIL'LER
- `/workspaces/Bunker OS` (eski repo) ve prod VPS **SALT-OKUNUR** — sadece referans/davranış kaynağı.
  Eski prod'a SSH/POST/deploy YOK.
- Türkçe yaz (kod/yorumlar), spec'teki kabul kriterlerine göre **her fazı doğrula** (typecheck + test +
  mümkünse `docker compose up` ile e2e). Bu ortamda docker YOK; lokal Postgres ile veya CI'da doğrula,
  docker e2e'yi cutover ortamında çalıştır.
- Sırrı asla commit etme; eski koddaki sızmış anahtarları (Qdrant key, DB şifresi, n8n API key) taşıma —
  rotate edilmiş kabul et, sadece env adıyla referans ver.
- Büyük kararı kod yazmadan netleştir; emin değilsen "DOĞRULANMADI" de.

## AÇIK SORULAR (ilgili fazda kullanıcıya sor — spec §9)
1. Onay akışı: e-posta reply mi, dashboard tek-tık mı, ikisi mi? (Faz 3 öncesi)
2. Gmail OAuth refresh token akışı + sender hesabı. (Faz 2 öncesi)
3. VPS gerçek specs + sağlayıcı (Hostinger/Hetzner, IP çelişkisi). (Faz 6 öncesi)
4. Haiku/Sonnet sürüm kimlikleri teyidi (`.env` override).
5. Reverb repo erişimi (birleşme kararı için).

## İLK ÇIKTI
DevFlow New Project'i başlat, `PROJECT-SPEC.md`'den PSA/epic/story'leri çıkar, Faz 1 plan + ilk gate'i
kullanıcıya sun. Başla.
