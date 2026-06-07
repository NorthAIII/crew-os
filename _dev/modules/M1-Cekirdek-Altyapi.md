# M1: Çekirdek Altyapı

**Sorumluluk:** Tüm modüllerin üstünde durduğu platform tabanı — auth, tenant çözümleme, DB erişimi, LLM client, worker zamanlayıcı.
**Bağımlılık:** Yok (herkes buna bağımlı)
**Sınır:** Kimlik/oturum, tenant config yükleme, Postgres bağlantısı + şema, Anthropic çağrı sarmalı, cron iskeleti. İş mantığı (outreach/brifing) M2/M3'te.

---

## Feature'lar

### F1.1: HMAC auth + login → ✅ (v3'ten taşındı)

**Açıklama:** Paylaşılan parola + HMAC-imzalı stateless cookie ile dashboard koruması.

**Kabul Kriterleri:**
- `/login` parola doğrular, imzalı cookie set eder
- Korumalı sayfalar oturumsuz erişimde `/login`'e yönlenir
- Token kurcalama/expiry timing-safe reddedilir
- `src/lib/auth/session.test.ts` (5 test) yeşil

**Edge Case'ler:** Yanlış parola, süresi geçmiş token, imza uyuşmazlığı — hepsi reddedilir.

### F1.2: Tenant çözümleme + profil → ✅ (taşındı)

**Açıklama:** `tenants` + `tenant_config`'ten tenant yükler; `buildTenantProfile()` ile prompt'a enjekte edilecek metin üretir. Sıfır Kiwi-hardcode.

**Kabul Kriterleri:** Slug → tenant config çözülür; eksikse fail-fast; profil metni marka/segment/pazar/maliyet içerir.

### F1.3: DB şema + migration (Drizzle) → ✅ (taşındı)

**Açıklama:** 14 tablo, multi-tenant (her tabloda tenant_id), Drizzle + postgres.js, snake_case.

**Kabul Kriterleri:** `db:migrate` lokal `crew_os`'a 14 tabloyu uygular; kısmi-unique index'li upsert'lerde `targetWhere` kullanılır.

**Edge Case'ler:** `WHERE ... IS NOT NULL` kısmi unique index → drizzle `onConflictDoUpdate`'e `targetWhere` ŞART (yoksa "no matching constraint" 500).

### F1.4: Anthropic LLM client → ✅ (taşındı)

**Açıklama:** `complete()` + `completeJson()` (prompt caching, tier=haiku|sonnet, graceful fallback).

**Kabul Kriterleri:** Haiku/Sonnet env-override edilebilir; JSON parse başarısızsa fallback döner; çağrı patlamaz.

### F1.5: Worker cron iskeleti → ✅ (taşındı)

**Açıklama:** node-cron: Hermes 4 saatte bir, Ops 09:00, Reflexion Pazar 23:00. `WORKER_ENABLED=false` ile kapatılabilir.

**Kabul Kriterleri:** Worker ayrı process; lokalde elle tetiklenebilir.

---

## Teknik Notlar

- DB bağlantısında HMR-safe global cache var; rebrand sırasında `_bunkerSql` → `_crewSql` temizlenecek (Sıradaki Faz: rebrand temizliği).
- `.env` gitignore'da; sırlar koda gömülmez (ILKELER).

---

**Son Güncelleme:** 2026-06-07
