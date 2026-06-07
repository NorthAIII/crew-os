# Hermes — Outreach Sekansı

## Özet

Hermes, Twenty'deki lead'lere segment ve adım (step) bazlı otomatik e-posta sekansı gönderir. Belirli aralıklarla (worker cron) çalışır, gönderilmeye hazır lead'leri bulur, lead'in segment+step'ine uygun şablonu doldurur, Gmail ile gönderir, ve lead'in sekans durumunu bir sonraki adıma ilerletir. Günlük gönderim sınırı ve açma/kapama kontrolü vardır.

## Kullanıcı Senaryoları

- Sistem her N saatte bir hazır lead'leri tarar; her uygun lead'e sıradaki şablonu gönderir, durumunu ilerletir.
- Kıvanç dashboard'dan Hermes'i açıp kapatabilir, günlük cap'i ve şablonları görebilir.
- Bir lead son adıma ulaşınca sekans durur (tamamlandı), yanıt gelmezse pasifleşir.

## Davranış Kuralları

- Günlük gönderim **cap**'i aşılamaz; cap dolduğunda o gün başka gönderim yapılmaz.
- Hermes **enabled=false** ise hiç gönderim yapılmaz.
- Yalnızca `nextFollowupAt <= now` ve aktif durumdaki lead'lere gönderilir.
- Şablon seçimi (segment, step) bazlıdır; segmente özel şablon yoksa "all" fallback kullanılır.
- Şablon `{{değişken}}` yer tutucuları lead + tenant_config'ten doldurulur.
- Gönderen kimliği (sender, CC) `tenant_config`'ten gelir — hardcode değil.
- Her gönderim `hermes_emails`'e (direction=out) loglanır; lead'in step ve nextFollowupAt'i ilerletilir.
- **Suppression** listesindeki adrese asla gönderilmez.
- Alıcı bilgisi **Twenty'den** gelir; sekans durumu Crew DB `outreach_state`'te (twenty_person_id ile) tutulur.

## Edge Case'ler ve Sınır Durumları

- E-posta kanalı olmayan segment (örn. telefon-only beauty-bc) sender tarafından atlanır.
- Aynı lead'e aynı gün mükerrer gönderim olmaz (step ilerleme + nextFollowupAt korur).

## Hata Durumları

- Gmail gönderimi başarısızsa: hata loglanır, lead durumu ilerletilmez (tekrar denenir), görünür kalır — sessiz başarısızlık yok.

## İlişkili Feature'lar

- `hermes-yanit-isleme.md` (gelen yanıt), `twenty-crm-kaynak.md` (alıcı + durum yazımı), `brifing-ve-onay.md` (dispatch OUTREACH).
