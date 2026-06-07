# QUALITY — Kalite Eksenleri

**Amaç:** Planlama, icra ve değerlendirme aşamalarında göz önünde bulundurulacak kalite kontrol noktaları
**Ne zaman okunmalı:** Kalite eksenlerine dokunan her aşamada — araştırma ve planlama, task icrası, UAT ve faz review

---

## Kalite Eksenleri

### 1. Modülerlik
- Kod, mantıksal olarak ayrılmış modüller halinde mi? Tek sorumluluk?
- Tekrar eden kod var mı? Ortak mantık paylaşılıyor mu?

**Kontrol sorusu:** "Bu parçayı bağımsız olarak değiştirebilir miyim?"

### 2. Güvenlik
- Girdiler validate/sanitize ediliyor mu? Her endpoint'te yetki kontrolü?
- Hassas veriler güvenli mi? Hata mesajları sır sızdırmıyor mu?
- (Crew OS: dashboard API'leri auth arkasında; sırlar env'de; Twenty/Postiz token'ları güvenli.)

**Kontrol sorusu:** "Kötü niyetli bir kullanıcı bunu nasıl istismar edebilir?"

### 3. Bakım Maliyeti
- Kod okunabilir mi? Karmaşık mantık açıklanmış mı? Config hardcode değil mi?

**Kontrol sorusu:** "6 ay sonra bunu değiştirmem gerekse ne kadar zor olur?"

### 4. Performans
- Gereksiz DB sorgusu (N+1)? Sayfalama? Cache? Gereksiz re-render?

**Kontrol sorusu:** "Bu 10x veri ile de aynı hızda çalışır mı?"

### 5. Hata Yönetimi
- Hatalar ele alınıyor mu? Anlamlı mesaj? Loglama? Graceful degradation?
- (Crew OS: LLM/Gmail/Twenty çağrılarında graceful fallback şart — dış sistem çökerse sessizce devre dışı kalmamalı, görünür olmalı.)

**Kontrol sorusu:** "Bu işlem başarısız olursa ne olur?"

### 6. Test Kapsamı
- Kritik iş mantığı test edilmiş mi? Edge case'ler? Testler bağımsız mı?

**Kontrol sorusu:** "Değiştirdikten sonra bir şeyin bozulup bozulmadığını nasıl bilirim?"

### 7. Erişilebilirlik (UI — dashboard için)
- Semantik HTML, kontrast, keyboard navigasyon, form label'ları.

**Kontrol sorusu:** "Fareyi olmayan biri bunu kullanabilir mi?"

---

## Projeye Özgü Eksenler

- **Veri Tutarlılığı (CRM kaynağı):** Twenty tek gerçek kaynak; Crew DB yalnızca pointer + ajan durumu. İki sistem arasında veri çoğaltma/ikinci kopya YASAK — tutarsızlık riski buradan doğar. Upsert'lerde idempotency.
- **API Tutarlılığı (entegrasyonlar):** Twenty (REST/GraphQL) ve Postiz (REST) çağrıları tek istemci modülünden, retry/rate-limit bilinciyle. Dış API değişimine dayanıklı sınır (anti-corruption layer).
- **Çok-tenant hazırlığı:** Her veri tenant_id ile izole; prompt/marka `tenant_config`'ten. White-label ileride satış için bel kemiği.
- **AGPL uyumu:** Twenty/Postiz değiştirilmeden yalnızca API'den tüketilir.

> **Öncelik sıralaması burada değil → `ILKELER.md`** ("En Yüksek Öncelikli Eksenler").

---

## Kalite Kontrol Sonuçlarının Kaydı

Faz review'ı tamamlandığında, sonuçlar ilgili faz dokümanına (`phases/PHASE-X.md`) yazılır. QUALITY.md sadece eksenleri tanımlar.

---

**Son Güncelleme:** 2026-06-07
