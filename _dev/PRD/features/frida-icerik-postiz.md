# Frida — İçerik Üretimi + Postiz Yayını (v0.5)

## Özet

Frida, marka sesine uygun sosyal medya içeriği üretir (Claude Sonnet) ve onaylandıktan sonra Postiz üzerinden zamanlayıp yayınlar. İçerik üretimi Crew OS'un (Frida), yayın motoru Postiz'in işidir. Üretilen içerik önce onay kuyruğuna düşer; insan onaylayınca Postiz API'sine gönderilir.

## Kullanıcı Senaryoları

- Brifing/komut bir içerik ihtiyacı belirler → Frida konu + marka sesinden içerik üretir, `content_queue`'ya yazar.
- Kıvanç dashboard'da içeriği önizler, düzenler/onaylar → içerik Postiz'de zamanlanır.
- Postiz içeriği hedef kanal(lar)a yayınlar; durum poll ile takip edilir.

## Davranış Kuralları

- İçerik **marka sesinden** (`tenant_config`) üretilir; platforma göre uyarlanır (karakter limiti vb.).
- Üretilen içerik **önce onay kuyruğuna** düşer — onaysız yayın yapılmaz.
- Onaylı içerik **Postiz REST API** (`/public/v1/upload` + `/public/v1/posts`) ile zamanlanır.
- Postiz **webhook sağlamaz** → yayın durumu **poll** ile alınır.
- Postiz **değiştirilmez**, yalnızca API'den (AGPL).
- Postiz rate-limit (90/saat) gözetilir.

## Hata Durumları

- Postiz yayın hatası: görünür + retry; sessiz başarısızlık yok.

## Açık Sorular

- Hangi kanallar v0.5'te aktif (X, LinkedIn, Instagram…)?
- Görsel üretimi kapsamda mı, yoksa metin + elle görsel mi?

## İlişkili Feature'lar

- `brifing-ve-onay.md` (ICERIK dispatch), `ops-dashboard.md` (içerik kuyruğu review).
