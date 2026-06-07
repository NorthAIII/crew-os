# PRD — Çalışma Durumu (SESSION-NOTES)

> PRD'nin anlık çalışma kanvası: açık sorular, keşfedilmemiş alanlar, hipotezler. Olgunlaşan bilgi PRD dokümanlarına aktarılır ve buradan izsiz silinir.

## Açık Sorular

- **Twenty barındırma (lokal dev):** Self-host Docker (host'ta, `host.docker.internal`) mı, Twenty Cloud mu? Karar Twenty entegrasyon fazında. Lokal geliştirmede Docker devcontainer'da yok — host Docker veya Cloud gerekecek.
- **Mevcut Kiwi lead verisi:** Eski sistemdeki/Apollo'daki lead'ler Twenty'ye nasıl ve ne zaman göç edecek? (v0.1 dogfood öncesi import gerekir.)
- **Gmail/Cal.com/Anthropic canlı sırları:** Dogfood için gerçek credential'lar ne zaman girilecek (Faz: brifing canlı / dogfood).
- **Dashboard kapsam detayı:** Onay kuyruğu dışında v0.1'de hangi ekranlar şart (Hermes aktivite + brifing yeterli mi, içerik kuyruğu v0.5'e mi)?

## Keşfedilmemiş Alanlar

- **Lead-gen (SerpAPI):** Yeni lead bulma akışı v0.1 kapsamında mı, sonraya mı? (Scout'ta opsiyonel web arama var ama lead-gen executor stub.)
- **Raporlama/analitik:** Ops günlük rapor var; haftalık/finans (eski Orion) Crew OS'ta gerekli mi?
- **Bildirim kanalı:** Slack mı, dashboard mı, e-posta mı — onay/uyarılar nereden gelsin?

## Gözlemler ve Hipotezler

- Onay-öğrenme döngüsü (Graduated Autonomy + Reflexion) sistemin en savunulabilir/özgün parçası — dashboard onay kuyruğu bu yüzden v0.1'in kalbi olmalı, sadece "güzel-olsa"lık bir ekran değil.
- Twenty'nin custom field/MCP olgunluğu genç; önce REST/GraphQL (olgun) üstüne kurmak, MCP'yi opsiyonel kolaylık yapmak daha güvenli (DECISIONS'ta kayıtlı yön).
