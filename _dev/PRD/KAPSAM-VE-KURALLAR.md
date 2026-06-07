# Crew OS — Kapsam, Kısıtlar ve Genel Kurallar

## Kapsam

**Dahil:**
- Outreach otomasyonu (Hermes): segment/step bazlı e-posta sekansı + LLM yanıt sınıflama.
- Brifing beyni: günlük AI sabah brifingi + pending aksiyon + insan onayı + Graduated Autonomy + Reflexion.
- Twenty CRM entegrasyonu: lead/contact/deal Twenty'de; ajanlar API/MCP ile okur-yazar.
- Ops dashboard (kendi yazdığımız): onay kuyruğu, Hermes aktivitesi, brifing, içerik kuyruğu.
- Frida içerik üretimi + Postiz yayını (v0.5).

**Dahil değil (kapsam dışı):**
- CRM tablo/pipeline UI — Twenty sağlar, biz yazmayız.
- Sosyal platformlara fiili post atma altyapısı — Postiz sağlar.
- Eski n8n sistemi (`ops.kiwiailab.com`) — ayrı, **dokunulmaz**, çalışmaya devam eder.
- Goose — şimdilik alınmaz.
- Telefon/SMS kanalı (beauty-bc) — ayrı tasarım, CASL riski; v0.1 dışı.

## Versiyon Stratejisi (özet — detay VERSIONS.md)

- **v0.1 (iç dogfood):** Hermes + Twenty + brifing + dashboard onayı, Kiwi için canlı.
- **v0.5:** Frida içerik + Postiz yayını.
- **v1.0:** Çok-tenant satış sertleştirmesi (onboarding, per-tenant secret/marka, izolasyon).

## Build-vs-Buy Kuralları

- Twenty (CRM) ve Postiz (yayın) **değiştirilmeden, yalnızca API/MCP'den** kullanılır. Fork'layıp kapalı-kaynak satış YOK (AGPL). Bu kural ileride SaaS satışında bizi korur.
- Twenty = lead/contact/deal/pipeline'ın **tek gerçek kaynağı**. Crew DB yalnızca pointer (`twenty_person_id`) + ajan durumu (sekans, karar, ders, içerik kuyruğu) tutar. **CRM verisinin ikinci kopyası yasak.**

## Genel Davranış Kuralları (sistem geneli)

- **İnsan onay kapısı:** Bir aksiyon kategorisi yeterli güven kazanana kadar (Graduated Autonomy eşiği) aksiyonlar insan onayından geçer. Onay/red kaydedilir, öğrenmeyi besler.
- **Otonomi öğrenerek açılır:** Başlangıçta her aksiyon insana sorulur; kategori onay oranı ≥%80 & n≥3 olunca oto-onay, ≤%20 & n≥3 olunca oto-red devreye girer.
- **Dış sistem hatası görünür olur:** LLM/Gmail/Twenty/Postiz çağrısı başarısızsa ajan sessizce devre dışı kalmaz — hata loglanır + (uygunsa) Slack/dashboard'da görünür, retry mantığı uygulanır.
- **Tenant-config tek kaynak:** Marka, segment, gönderen, Cal.com linki, fiyat vb. `tenant_config`'ten gelir; koda gömülmez.

## Güvenlik ve Gizlilik

- Sırlar `.env` / merkezi env modelinde; koda asla gömülmez (eski repodaki commit'li-sır hataları tekrarlanmaz).
- Dashboard API'leri auth arkasında (HMAC session); auth'suz açık endpoint yok.
- Twenty `ENCRYPTION_KEY` ve OAuth token yedeği kritik — kaybı = tüm token kaybı.
- Opt-out (suppression) mutlak: suppression listesindeki adrese asla gönderim yapılmaz.

## Kısıtlar ve Tercihler

- **LLM:** Tek sağlayıcı Anthropic (Haiku routing/sınıflama, Sonnet içerik/strateji). Çok-provider karmaşası bilinçli reddedildi.
- **KB:** Postgres full-text search (vektör DB yok); ölçeklenirse pgvector yolu açık.
- **Stack:** Next.js 15 + TS + Drizzle/Postgres + node-cron worker; dashboard shadcn/ui + Tremor.
- **Çalıştırma:** Lokal-önce (Docker'sız çekirdek); ileride Hetzner VPS (opsiyonel). Operasyonel yalınlık (az servis, az bakım) gözetilir.
