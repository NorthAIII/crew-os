# Hermes — Yanıt İşleme / Sınıflama

## Özet

Lead'lerden gelen e-posta yanıtlarını Hermes otomatik olarak sınıflar (toplantı talebi / olumlu / olumsuz / otomatik-yanıt) ve sınıfa göre aksiyon alır: toplantı talebine Cal.com linkiyle yanıt verir, olumsuz/opt-out'u suppression'a ekler, ilgili kişiyi bilgilendirir. Sınıflama önce hızlı keyword override (TR/EN/DE), sonra Claude Haiku ile yapılır.

## Kullanıcı Senaryoları

- Lead "ilgilenmiyorum / çıkar beni" yazar → sistem opt-out algılar, suppression'a ekler, bir daha gönderim yapmaz.
- Lead "görüşelim / uygun musunuz" yazar → sistem toplantı talebi algılar, Cal.com linkini yollar.
- Lead olumlu/nötr yanıt verir → ilgili kişiye (Slack) bildirim düşer, Twenty'ye aktivite yazılır.

## Davranış Kuralları

- Sınıflama önce **keyword override** (opt-out tespiti, çok-dilli) ile, eşleşme yoksa **Haiku** ile yapılır.
- Geçerli sınıflar: meeting_request, positive, negative, out_of_office (+ belirsiz → fallback).
- **negative / opt-out** → adres `email_suppression`'a eklenir; sonraki sekanslar durur.
- **meeting_request** → tenant_config'teki Cal.com linkiyle yanıt gönderilir.
- Her gelen yanıt `hermes_emails`'e (direction=in, sınıf ile) loglanır.
- Sonuç **Twenty'ye** yazılır: ilgili Person'a aktivite/not + outreachStatus güncellenir.
- Önemli yanıtlarda (toplantı/olumlu) bildirim kanalına (Slack) haber düşer.

## Edge Case'ler ve Sınır Durumları

- Çok-dilli/belirsiz yanıt → Haiku fallback; emin değilse insana görünür bırakılır (sessizce yanlış aksiyon alma).
- Otomatik yanıt (OOO) → sekansı bozmaz, opt-out sayılmaz.

## Hata Durumları

- Haiku çağrısı başarısızsa: keyword sonucu varsa o kullanılır; yoksa yanıt "işlenmedi/görünür" bırakılır, sessizce kaybolmaz.

## İlişkili Feature'lar

- `hermes-outreach.md`, `twenty-crm-kaynak.md` (aktivite/durum yazımı), `ops-dashboard.md` (Hermes aktivite ekranı).
