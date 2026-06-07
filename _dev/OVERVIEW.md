# Crew OS — Proje Özeti

**Proje Sahibi:** KiwiAI Lab (Kıvanç)
**Başlangıç Tarihi:** 2026-06-07

---

## Bu Doküman Hakkında

**OVERVIEW.md** projenin genel referans dokümanıdır. Her oturum başında mutlaka okunmalıdır. **Yalnızca statik bilgi** içerir — proje kimliği, stack, amaç, kapsam. Dinamik bilgi (aktif faz/task, ilerleme, durum) buraya **yazılmaz**; onların evi DURUM.md'dir.

**Not:** Bu dosya projenin README'si değildir; DevFlow geliştirme sürecine yönelik bir özettir ve `_dev/` içinde yaşar.

---

## Proje Özeti

### Ne Yapıyor?
Crew OS, KiwiAI Lab'in kendi satış-operasyonunu yürüten **agentic işletim sistemidir**: lead'lere otomatik e-posta sekansı (Hermes), gelen yanıtların LLM ile sınıflanması, günlük AI sabah brifingi + insan onaylı aksiyon dağıtımı (brifing beyni), ve sosyal içerik üretimi (Frida). CRM kayıt/UI katmanı için açık kaynak **Twenty**, sosyal yayın için **Postiz** kullanılır; agentic zekâ kendimizindir.

### Hangi Problemi Çözüyor?
2.5 kişilik bir ekibin satış+ops iş yükünü otomatikleştirmek (dogfood-first). İkincil hedef: beğenilen modüllerin (Hermes, Frida) ileride başka firmalara hizmet olarak satılabilmesi.

### Hedef Kitle
Birincil: KiwiAI Lab içi kullanım. İkincil (ileride): KOBİ'lere yönelik white-label/çok-tenant satış.

### Kapsam
**Dahil:** Outreach (Hermes), brifing beyni + onay-öğrenme döngüsü, Twenty CRM entegrasyonu, kendi yazdığımız ops dashboard'u (onay kuyruğu/aktivite/brifing), Frida içerik + Postiz yayını.
**Dahil değil:** CRM tablo/pipeline UI'ı (Twenty sağlar), sosyal platformlara doğrudan post atma altyapısı (Postiz sağlar). Eski n8n sistemi (`ops.kiwiailab.com`) — ayrı, dokunulmaz.

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript; dashboard: shadcn/ui + Tremor (planlı) |
| Backend | Next.js API routes + ayrı Node worker (node-cron) |
| Veritabanı | PostgreSQL + Drizzle ORM (postgres.js); KB = Postgres full-text search (vektör DB yok) |
| LLM | Anthropic Claude (TEK sağlayıcı): Haiku (sınıflama/routing) + Sonnet (içerik/strateji) |
| Dış sistemler (build-vs-buy) | Twenty (CRM, AGPL), Postiz (sosyal yayın, AGPL), Gmail API (Hermes), Cal.com, Slack |
| Auth | HMAC-imzalı cookie + paylaşılan parola (iç kullanım MVP) |
| Deployment | Lokal-önce (Node + lokal Postgres, Docker'sız); ileride Hetzner VPS (opsiyonel) |

**Detaylar:** `docs/DECISIONS.md`

---

## Temel Özellikler

- **Hermes** — otomatik outreach sekansı + LLM yanıt sınıflama (sistemin kanıtlanmış kalbi)
- **Brifing beyni** — Scout→Strategist⇄Critic→Conductor pipeline + Graduated Autonomy + Reflexion (onay-öğrenme döngüsü)
- **Twenty entegrasyonu** — CRM'in tek gerçek kaynağı; ajanlar API/MCP ile okur-yazar
- **Ops dashboard** — onay kuyruğu (tek-tık), Hermes aktivitesi, brifing, içerik kuyruğu
- **Frida** — markaya uygun sosyal içerik üretimi → Postiz ile yayın

**Detaylar:** `MODULE-MAP.md`, `modules/`

---

## Kaynak Kod Yapısı

```
src/
├── app/                 # Next.js App Router (login, korumalı sayfalar, API routes, webhooks)
├── lib/
│   ├── hermes/          # Outreach: gmail, sequence-sender, reply-handler, classify, policy, templates
│   ├── agents/          # Brifing beyni: scout/strategist/critic/conductor + autonomy/reflexion/pipeline/kb/metrics/ops/dispatch
│   ├── auth/            # HMAC session + parola
│   ├── tenant/          # Tenant çözümleme + profil enjeksiyonu (prompt'lara)
│   ├── api/             # withTenant middleware
│   ├── llm/             # Anthropic client + model id'leri
│   ├── leads/           # CSV import (Apollo eşleme)
│   ├── webhooks/        # Cal.com parse + handler
│   ├── notify/          # Slack
│   └── (twenty/)        # YENİ: Twenty CRM istemcisi (Faz: Twenty entegrasyonu)
├── db/                  # Drizzle schema + connection + migrate
└── worker/              # node-cron: Hermes 4h, Ops 09:00, Reflexion Pazar 23:00
```

---

## Proje Konumları

| Açıklama | Yol |
|----------|-----|
| Repo Kökü | `/workspaces/crew-os` |
| GitHub | `https://github.com/NorthAIII/crew-os` |
| DevFlow Dokümanları | `/workspaces/crew-os/_dev/` |
| Kaynak Kod | `/workspaces/crew-os/src/` |
| Çalışan Uygulama (lokal) | `http://localhost:3000` (parola env: `AUTH_PASSWORD`) |
| Donör (referans, salt-okunur) | `/workspaces/bunker` (Bunker OS v3) |

---

## Doküman Yapısı

```
_dev/
├── OVERVIEW.md        # Bu dosya
├── ILKELER.md         # Proje ilkeleri (karar fazlarında okunur)
├── INDEX.md           # Navigasyon haritası
├── DURUM.md           # Canlı dashboard
├── MEMORY.md          # Proje hafızası index'i
├── memory/            # Öğrenim dosyaları (lazy-load)
├── MODULE-MAP.md      # Modül/feature haritası
├── PHASES.md          # Faz durum özeti + sıradaki fazlar
├── QUALITY.md         # Kalite eksenleri
├── modules/           # Modül detay dokümanları
├── phases/            # Faz dokümanları
├── docs/              # DECISIONS.md vb.
└── tasks/             # Task dokümanları ve arşiv
```

CLAUDE.md repo kökündedir (kickoff-verify'da oluşturulur).

---

> Operasyonel talimatlar (oturum protokolü, numaralama) CLAUDE.md'dedir; burada tekrarlanmaz.

---

**Son Güncelleme:** 2026-06-07
