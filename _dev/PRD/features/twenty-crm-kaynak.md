# Twenty — CRM Kaynağı (lead import + Cal.com + outreach_state)

## Özet

Twenty, lead/contact/deal verisinin tek gerçek kaynağıdır. İnsanlar CRM'i Twenty UI'ından yönetir; Crew OS ajanları veriyi Twenty API/MCP ile okur-yazar. Crew DB, CRM verisinin kopyasını tutmaz — yalnızca `twenty_person_id` pointer + ajan durumu (outreach sekansı) tutar. Lead import artık Twenty'ye yazar; Cal.com toplantıları Twenty'de deal/aktivite olur.

## Kullanıcı Senaryoları

- Kıvanç CSV (Apollo) lead listesi yükler → kişiler Twenty'de Person olarak görünür (segment, durum alanlarıyla).
- Hermes bir lead'e e-posta atacağında alıcı bilgisini Twenty'den çeker; sekans ilerleyişini Crew DB'de tutar.
- Lead toplantı ayarlar (Cal.com) → Twenty'de bir Opportunity/Activity oluşur.
- Kıvanç pipeline'ı, kişileri, deal'leri Twenty arayüzünden görür/yönetir (Crew dashboard'ı değil).

## Davranış Kuralları

- Lead/contact/deal/pipeline'ın **tek gerçek kaynağı Twenty**; Crew DB'de ikinci kopya tutulmaz.
- Crew DB yalnızca **pointer + ajan durumu** tutar: `outreach_state(tenant_id, twenty_person_id, segment, step, next_followup_at, status)`.
- CSV/Apollo import **Twenty'ye Person** yazar; e-posta ile **idempotent upsert** (tekrar import çift kayıt yaratmaz).
- Twenty Person'a custom field'lar tanımlanır: `segment`, `outreachStatus`, `lastContactedAt`.
- Cal.com webhook'u toplantıyı **Twenty'de** Opportunity/Activity olarak yazar; iptal işlenir.
- Twenty ile tüm alışveriş **tek istemci modülünden** (`src/lib/twenty/`) geçer; retry + rate-limit bilinçli.
- Twenty **değiştirilmez**, yalnızca API/MCP'den tüketilir (AGPL).

## Edge Case'ler ve Sınır Durumları

- Twenty erişilemezse: ajan sessizce devre dışı kalmaz — hata görünür + retry; yazma işlemleri kaybolmaz.
- Custom field henüz tanımsızsa: import/yazım fail-fast + net hata, yanlış alana yazma yok.

## Açık Sorular

- Lokal geliştirmede Twenty barındırma: host Docker mı, Twenty Cloud mu? (SESSION-NOTES)
- Mevcut Kiwi lead'lerinin Twenty'ye ilk göçü ne zaman/nasıl?

## İlişkili Feature'lar

- `hermes-outreach.md`, `hermes-yanit-isleme.md` (Twenty'den okur/yazar), `brifing-ve-onay.md` (CRM metrik).
