# Crew OS — Proje İlkeleri

---

## Bu Doküman Hakkında

**ILKELER.md** bu projenin yön-veren ilkelerini tutar — "kararsız kaldığında neye göre karar ver, neyi feda etme, bu projenin ufku ne?" Nadiren ve **bilinçli** değişir; karar-şekillendiren fazlarda (prd, prd-refine, prd-review, kickoff, discuss, research, plan) okunur ve önerileri yönlendirir.

**Nasıl kullanılır:** Q&A fazlarında Claude gri alan sorularını boş sormak yerine, ilgili ilkeye göre cevabı önceden doldurur ve kullanıcıya **teyit ettirir**. Bir ilkeyle gerçek bir gerilim doğarsa açıkça kullanıcıya getirir — sessizce bir tarafı seçmez.

### Bilginin Doğru Evi — bu doküman NE tutmaz

ILKELER yalnızca **yön ve önceliği** taşır, mekanizmayı/detayı değil.
- Değerlendirme ekseni → `QUALITY.md`
- Somut teknik kural (framework versiyonu, isimlendirme) → `CLAUDE.md` Projeye Özgü Kurallar
- Ürün vizyonu, feature, davranış kuralı → `_dev/PRD/`
- Spesifik mimari/tasarım kararı → `docs/DECISIONS.md`

---

## Temel İlkeler

### Kalıcılık önceliği

En kalıcı ve ileriye dönük çözümü seç. Kısa vadeli hız uğruna uzun vadeli sağlamlığı feda etme; "şimdilik çalışıyor" bir bitiş kriteri değildir.

### Sır ve konfigürasyon yönetimi

Secret'lar ve ortama bağlı değerler koda gömülmez. Merkezi, değişken-tabanlı bir model kullanılır: aynı kod her ortamda farklı değerlerle çalışır. (Crew OS'ta tüm tenant'a-özgü değerler `tenant_config`'te; `.env` gitignore'da.)

### Kümülatif test altyapısı

Test atlanmaz. Test altyapısı her geliştirmeyle üstüne koyarak büyür — her yeni yetenek kendi güvencesini getirir. (Devraldığımız taban: 44 birim test, DB'siz.)

---

## Bu Projeye Özgü

Kickoff/PRD sırasında doldurulur. Boş bir alan "henüz konuşulmadı" demektir — varsayma, gerektiğinde kullanıcıya sor.

### Proje Ufku

Yıllarca yaşayacak bir **iç altyapı** — kararlar kalıcılığa göre değerlendirilir. "Şimdilik çalışıyor" bir bitiş kriteri değil. İleride başka firmalara satılabilme ihtimali açık tutulur (zorlanmaz), bu yüzden çok-tenant temeli korunur.

### En Yüksek Öncelikli Eksenler

1. **Veri tutarlılığı** (QUALITY → Veri Tutarlılığı) — Twenty tek gerçek kaynak; ikinci kopya yok.
2. **Güvenlik** (sır yönetimi + auth) — iç sistem ama sırlar/erişim gevşek bırakılmaz.
3. **Hata yönetimi / görünürlük** — dış sistem (LLM/Gmail/Twenty/Postiz) çökerse ajan sessizce devre dışı kalmaz, görünür olur.

Bunlar **hız ve estetikten** önce gelir.

### Pazarlık Konusu Olmayanlar

- **İnsan onay kapısı** — ajanlar güven kazanana kadar (Graduated Autonomy) aksiyonlar insan onayından geçer; onay-öğrenme döngüsü sistemin özünü oluşturur, atlanmaz.
- **Twenty = CRM'in tek gerçek kaynağı** — lead/contact/deal verisi Crew DB'de çoğaltılmaz.
- **Sır güvenliği** — secret koda gömülmez; `.env`/merkezi model, koda asla.
- **Test atlanmaz** — devraldığımız 44 test korunur, her yetenek kendi güvencesini getirir.

---

**Son Güncelleme:** 2026-06-07
