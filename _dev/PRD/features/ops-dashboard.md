# Ops Dashboard

## Özet

Crew OS'un insan-yüzü ops paneli. CRM tablolarını göstermez (onlar Twenty'de) — ajan-özel ekranlara odaklanır: onay kuyruğu (tek-tık approve/reject), Hermes aktivitesi/durumu, günlük brifing görüntüleme, ve (v0.5) içerik kuyruğu review. Next.js içinde shadcn/ui + Tremor ile yazılır; tüm ekranlar auth arkasındadır.

## Kullanıcı Senaryoları

- Kıvanç giriş yapar (parola), onay kuyruğunu görür, aksiyonları tek-tıkla onaylar/reddeder.
- Hermes ekranında: gönderilen/gelen e-postalar, sekans durumu, günlük cap kullanımı, suppression.
- Brifing ekranında: bugünkü brifing + geçmiş brifingler, metrik kartları.

## Davranış Kuralları

- **Tüm dashboard sayfaları ve API'leri auth arkasında** (HMAC session); auth'suz erişim `/login`'e yönlenir.
- **Onay kuyruğu** pending aksiyonları listeler; onay → `crew_decisions` kaydı + dispatch; red → kayıt.
- Oto-onaylanmış aksiyonlar da görünür (şeffaflık).
- Veriler ilgili kaynaktan **okunur**, dashboard'da çoğaltılmaz (Hermes durumu Crew DB'den, CRM detayı gerekiyorsa Twenty'den).
- Boş durumlar anlamlı gösterilir (ör. "bekleyen onay yok").

## Boş ve Varsayılan Durumlar

- İlk açılışta veri yokken: her ekran boş-durum mesajı gösterir, hata vermez.

## Edge Case'ler ve Sınır Durumları

- Eşzamanlı çift-onay: ikinci onay no-op (idempotent), çift dispatch olmaz.

## İlişkili Feature'lar

- `brifing-ve-onay.md` (onay kuyruğu kaynağı), `hermes-outreach.md` / `hermes-yanit-isleme.md` (aktivite), `frida-icerik-postiz.md` (içerik kuyruğu, v0.5).
