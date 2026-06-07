# M4: Twenty Entegrasyonu (CRM Kaynağı) — [YENİ]

**Sorumluluk:** Twenty'yi CRM'in tek gerçek kaynağı yapar; Crew OS ajanlarının lead/contact/deal verisini API/MCP ile okuyup yazmasını sağlar. Crew DB yalnızca `twenty_person_id` pointer + ajan durumu tutar.
**Bağımlılık:** M1 (db/tenant); kullanan: M2 (Hermes alıcı/yazım), M3 (CRM metrik)
**Sınır:** Twenty ile veri alışverişi + custom field/mapping + outreach_state pointer. CRM UI/tablo Twenty'nin kendisi (yazmıyoruz). Henüz kod YOK — bu modülün tamamı yapılacak.

---

## Feature'lar

### F4.1: Twenty istemcisi (REST/GraphQL) → ⬜

**Açıklama:** `src/lib/twenty/` — Twenty REST/GraphQL API sarmalı (auth: API key/Bearer), retry + rate-limit (100 req/dk) bilinçli, anti-corruption layer.

**Kabul Kriterleri:** Person/Company/Opportunity CRUD; hata/timeout graceful; tek istemci modülünden geçer.

**Bağımlılık:** Twenty instance (self-host Docker veya Twenty Cloud — karar bu fazda).

**Edge Case'ler:** Twenty erişilemezse ajan sessizce devre dışı kalmamalı, görünür hata + retry.

### F4.2: Person custom field + mapping → ⬜

**Açıklama:** Twenty Person'a custom field'lar (`segment`, `outreachStatus`, `lastContactedAt`) + Crew tipleriyle eşleme.

**Kabul Kriterleri:** Custom field'lar metadata API ile tanımlı; mapping iki yönlü doğru.

### F4.3: Lead import → Twenty → ⬜

**Açıklama:** CSV/Apollo import artık `leads` tablosuna değil Twenty'ye Person yazar (mevcut `csv-import.ts` saf parse'ı korunur, hedef değişir).

**Kabul Kriterleri:** CSV import → kayıt Twenty UI'da görünür; tekrarlı import idempotent (e-posta ile upsert).

### F4.4: outreach_state pointer + Hermes bağlama → ⬜

**Açıklama:** Crew DB'de ince `outreach_state` tablosu (`tenant_id`, `twenty_person_id`, `segment`, `step`, `next_followup_at`, `status`). Hermes alıcıyı buradan + Twenty'den çeker; sonuç Twenty'ye aktivite/durum + Crew suppression.

**Kabul Kriterleri:** `hermes:dryrun` Twenty'den (mock) alıcı çeker; yanıt Twenty kaydını + suppression'ı günceller; `leads`/`meetings` tabloları kaynak-kayıt olmaktan çıkar.

**Bağımlılık:** F4.1, F4.2, M2

### F4.5: Cal.com → Twenty aktivite/deal → ⬜

**Açıklama:** Cal.com webhook (mevcut parse korunur) toplantıyı Twenty'de Opportunity/Activity olarak oluşturur (eski `meetings` tablosu yerine).

**Kabul Kriterleri:** Booking → Twenty'de deal/activity; iptal işlenir.

---

## Teknik Notlar

- **Veri sınırı (kritik):** Crew, CRM verisinin ikinci kopyasını TUTMAZ — yalnızca pointer + ajan durumu. Twenty okumaları talep anında.
- **AGPL:** Twenty değiştirilmez, yalnızca API'den. MCP opsiyonel kolaylık; taban REST/GraphQL (olgun).
- **Mevcut `leads`/`meetings` tabloları:** Geçiş tamamlanınca emekliye ayrılır; göç planı bu fazda.

---

**Son Güncelleme:** 2026-06-07
