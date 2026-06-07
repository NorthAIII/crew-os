# VERSIONS — Feature-Versiyon Haritası

> Tek kaynak: hangi feature hangi versiyonda. Feature dokümanları versiyon tekrarı yapmaz.

## Versiyon Hedefleri

| Versiyon | Hedef (milestone) |
|----------|-------------------|
| **v0.1** | İç dogfood — Kiwi için canlı: lead'ler Twenty'de, Hermes gerçek outreach + yanıt sınıflama, günlük brifing, dashboard'dan tek-tık onay. |
| **v0.5** | İçerik — Frida üretir, Postiz yayınlar (onaylı). |
| **v1.0** | Çok-tenant satış sertleştirmesi — onboarding, per-tenant secret/marka, izolasyon. |

## Feature-Versiyon Tablosu

| Feature | Feature Dosyası | Versiyon |
|---------|-----------------|----------|
| Hermes — outreach sekansı | `features/hermes-outreach.md` | v0.1 |
| Hermes — yanıt işleme/sınıflama | `features/hermes-yanit-isleme.md` | v0.1 |
| Twenty CRM kaynağı (lead import + Cal.com + outreach_state) | `features/twenty-crm-kaynak.md` | v0.1 |
| Brifing beyni + onay kuyruğu (Graduated Autonomy + Reflexion) | `features/brifing-ve-onay.md` | v0.1 |
| Ops dashboard | `features/ops-dashboard.md` | v0.1 |
| Frida içerik + Postiz yayını | `features/frida-icerik-postiz.md` | v0.5 |
| Çok-tenant satış sertleştirmesi | _(v1.0'da feature dosyası açılacak)_ | v1.0 |

> Not: M1 Çekirdek (auth/tenant/db/llm/worker) v3'ten taşındı; ayrı feature olarak değil, tüm v0.1 feature'larının tabanı olarak ele alınır.
