# MODULE-MAP — Modül ve Feature Haritası

**Amaç:** Projenin modüler yapısını ve feature haritasını özetlemek
**Ne zaman okunmalı:** Planlama ve review sırasında
**Not:** Modül detayları `modules/` klasöründeki ayrı dosyalardadır. Bu doküman sadece genel harita ve matristir.

---

## Modül Haritası

```
Crew OS
├── M1: Çekirdek Altyapı (auth · tenant · db · llm · worker)
│   ├── F1.1: HMAC auth + login            → ✅ (taşındı)
│   ├── F1.2: Tenant çözümleme + profil    → ✅ (taşındı)
│   ├── F1.3: DB şema + migration (Drizzle) → ✅ (taşındı)
│   ├── F1.4: Anthropic LLM client          → ✅ (taşındı)
│   └── F1.5: Worker cron iskeleti          → ✅ (taşındı)
├── M2: Hermes — Outreach
│   ├── F2.1: Sequence-sender (Gmail)       → ✅ (taşındı) · ⚠ alıcı kaynağı Twenty'ye taşınacak
│   ├── F2.2: Reply-handler + sınıflama     → ✅ (taşındı) · ⚠ sonuç Twenty'ye yazılacak
│   └── F2.3: Templates/policy/suppression  → ✅ (taşındı)
├── M3: Brifing Beyni (Crew)
│   ├── F3.1: Scout/Strategist/Critic/Conductor pipeline → ✅ (taşındı)
│   ├── F3.2: Graduated Autonomy             → ✅ (taşındı)
│   ├── F3.3: Reflexion (öğrenme döngüsü)    → ✅ (taşındı)
│   ├── F3.4: KB (Postgres FTS)              → ✅ (taşındı)
│   └── F3.5: Dispatch executor'ları         → 🟡 (OUTREACH var; ICERIK/CRM/ARASTIRMA stub)
├── M4: Twenty Entegrasyonu (CRM kaynağı)    [YENİ]
│   ├── F4.1: Twenty istemcisi (REST/GraphQL) → ⬜
│   ├── F4.2: Person custom field + mapping   → ⬜
│   ├── F4.3: Lead import → Twenty            → ⬜
│   ├── F4.4: outreach_state pointer + Hermes bağlama → ⬜
│   └── F4.5: Cal.com → Twenty aktivite/deal   → ⬜
├── M5: Ops Dashboard (shadcn/ui + Tremor)    [YENİ]
│   ├── F5.1: Onay kuyruğu (tek-tık approve/reject) → ⬜
│   ├── F5.2: Hermes aktivite/durum ekranı     → ⬜
│   ├── F5.3: Brifing görüntüleme              → ⬜
│   └── F5.4: İçerik kuyruğu review            → ⬜
└── M6: Frida + Postiz (İçerik)               [YENİ · sonraki versiyon]
    ├── F6.1: Frida içerik üretici (LLM)       → ⬜
    └── F6.2: Postiz yayın istemcisi           → ⬜
```

---

## Modüller Arası Bağımlılıklar

```
M1 (Çekirdek) ← herkes
M2 (Hermes) → M1, M4 (alıcı/yazım Twenty'den)
M3 (Brifing) → M1, M2 (metrik), M4 (CRM metrik), dispatch → M2/M6
M4 (Twenty)  → M1
M5 (Dashboard) → M1, M2, M3, M6 (veriyi gösterir)
M6 (Frida)   → M1, dispatch (M3)
```
Twenty CRM'in tek gerçek kaynağıdır; Crew DB yalnızca pointer + ajan durumu tutar (ikinci kopya yok).

---

## Modül Dokümanları

| Modül | Doküman | Açıklama |
|-------|---------|----------|
| M1 | `modules/M1-Cekirdek-Altyapi.md` | Auth, tenant, db, llm, worker |
| M2 | `modules/M2-Hermes-Outreach.md` | E-posta sekansı + yanıt sınıflama |
| M3 | `modules/M3-Brifing-Beyni.md` | Çok-ajan pipeline + autonomy + reflexion |
| M4 | `modules/M4-Twenty-Entegrasyonu.md` | CRM kaynağı; ajan okuma/yazma |
| M5 | `modules/M5-Ops-Dashboard.md` | Onay kuyruğu, aktivite, brifing UI |
| M6 | `modules/M6-Frida-Postiz.md` | İçerik üretimi + sosyal yayın |

---

## Feature-Faz Matrisi

| Feature | Modül | Versiyon | Faz | Durum |
|---------|-------|----------|-----|-------|
| F1.1–F1.5 Çekirdek | M1 | v0.1 | — (taşındı) | ✅ |
| F2.1–F2.3 Hermes | M2 | v0.1 | — (taşındı) | ✅ |
| F3.1–F3.4 Brifing | M3 | v0.1 | — (taşındı) | ✅ |
| F3.5 Dispatch executor'ları | M3 | v0.1 | — | 🟡 |
| F4.1–F4.5 Twenty entegrasyonu | M4 | v0.1 | — | ⬜ |
| F5.1–F5.4 Dashboard | M5 | v0.1 | — | ⬜ |
| F2.x Hermes↔Twenty dikişi | M2 | v0.1 | — | ⬜ |
| F6.1–F6.2 Frida+Postiz | M6 | v0.5 | — | ⬜ |

**Durum simgeleri:**
- ⬜ **Bekliyor** — Fazı henüz başlamadı
- 🔄 **Devam ediyor** — Fazı aktif
- 🟡 **Kısmen tamamlandı**
- ✅ **Tamamlandı** — Kabul kriterleri karşılandı, UAT'tan geçti

> Modül detayları → `modules/MX-*.md`. "✅ (taşındı)" = Bunker OS v3'ten kanıtlanmış halde getirildi (44 test yeşil), ama DevFlow faz döngüsünden henüz geçmedi. Faz/versiyon sütunları kickoff/PRD'de kesinleşir.

---

**Son Güncelleme:** 2026-06-07
