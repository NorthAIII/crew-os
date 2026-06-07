# M5: Ops Dashboard (shadcn/ui + Tremor) — [YENİ]

**Sorumluluk:** Crew OS'un insan-yüzü ops paneli — ajan-özel ekranlar: onay kuyruğu (tek-tık approve/reject), Hermes aktivitesi, günlük brifing görüntüleme, içerik kuyruğu review.
**Bağımlılık:** M1 (auth), M2/M3/M6 (veri)
**Sınır:** Ajan operasyonu görünürlüğü + onay aksiyonu. CRM tablo/pipeline görünümleri Twenty'de (burada değil). v3'te placeholder; gerçek ekranlar yapılacak.

---

## Feature'lar

### F5.1: Onay kuyruğu (tek-tık approve/reject) → ⬜

**Açıklama:** Brifing beyninin ürettiği pending aksiyonları listeler; tek tıkla onayla/reddet → dispatch + Graduated Autonomy'ye karar kaydı.

**Kabul Kriterleri:** Pending aksiyon listelenir; onay → `crew_decisions` + dispatch tetikler; red → kayıt. Auth arkasında.

**Bağımlılık:** M3 (pipeline/decisions), M2/M6 (dispatch hedefi)

**Edge Case'ler:** Eşzamanlı çift-onay; oto-onaylanmış aksiyonların görünürlüğü.

### F5.2: Hermes aktivite/durum ekranı → ⬜

**Açıklama:** Gönderilen/gelen e-postalar, sekans durumu, suppression, günlük cap kullanımı.

**Kabul Kriterleri:** `hermes_emails` + outreach_state özetlenir; segment bazlı durum.

### F5.3: Brifing görüntüleme → ⬜

**Açıklama:** Günlük Conductor brifingi + geçmiş brifingler; metrik kartları (Tremor).

**Kabul Kriterleri:** Son brifing render; tarih bazlı geçmiş.

### F5.4: İçerik kuyruğu review → ⬜

**Açıklama:** Frida'nın ürettiği içerikler (content_queue) önizleme + onay → Postiz'e gönderim.

**Kabul Kriterleri:** İçerik listelenir; onay M6 dispatch'i tetikler.

---

## Teknik Notlar

- **Stack:** shadcn/ui (bileşen) + Tremor (metrik/grafik), MIT, Next-native, sıfır ekstra servis (bkz DECISIONS 2026-06-07).
- Auth: M1 mevcut session guard; tüm dashboard API'leri korumalı.
- Onay akışı ürünün kalbi — UX kendimizde, low-code araç yok.

---

**Son Güncelleme:** 2026-06-07
