# KiwiAI Lab — Fiyatlandırma

**Not:** Sitede fiyat gösterilmez. Bu doküman internal use içindir ve General Assistant agent tarafından kullanılır.

---

## Fiyatlama Felsefesi

Saatlik çalışmıyoruz. Proje ya da aylık retainer bazlı çalışıyoruz.
Fiyat asla saat başı belirtilmez — sonuç bazlı ve algı bazlı fiyatlama yapıyoruz.

Discovery call öncesi fiyat tartışılmaz. "Ne kadar tutar?" sorusuna:
> "Sistemi ve ihtiyaçlarınızı doğru anlamadan bir rakam vermek size haksızlık olur. 30 dakikalık konuşmadan sonra net bir rakam vereceğim."

---

## Bunker OS (Tam Otomasyon Sistemi)

### Starter (1 agent, temel pipeline)
- Lead Agent (webhook → Postgres → Instantly.ai → Slack)
- Cal.com entegrasyonu
- Slack bildirimleri
- **Kurulum:** 2.500 – 3.500 EUR
- **Aylık bakım:** 500 EUR/ay

### Growth (4 agent, tam sistem)
- Lead Agent + Meeting Agent + General Assistant + Social Media Creator
- Qdrant KB (50 doküman)
- Monthly content calendar (20 post/ay)
- **Kurulum:** 5.000 – 8.000 EUR
- **Aylık bakım:** 1.200 EUR/ay

### Custom (Enterprise veya özel ihtiyaç)
- İstenilen sayıda agent
- WhatsApp entegrasyonu
- GHL / HubSpot CRM sync
- Özel dil (Almanca, Arapça vb.)
- **Fiyat:** Discovery call sonrası → minimum 10.000 EUR kurulum

---

## AI Web (Web Sitesi + AI Asistan)

### Statik Site + AI Chat
- HTML/CSS/JS veya Next.js
- Gömülü AI widget (Claude veya OpenAI bazlı)
- Lead yakalama → Bunker veya müşteri CRM entegrasyonu
- **Fiyat:** 2.000 – 3.500 EUR (tek seferlik)

### Full Web Application + AI
- Next.js + authentication + DB
- Özel AI agent (müşteriye özel KB)
- CRM entegrasyonu
- **Fiyat:** 4.000 – 7.000 EUR

---

## AI Integration (Mevcut Araca AI Ekleme)

- GHL + AI scoring: 1.500 EUR + 300 EUR/ay
- Notion + AI KB asistanı: 800 – 1.500 EUR
- Web sitesine chat widget: 600 – 1.200 EUR
- Google Drive RAG asistanı: 1.000 – 2.000 EUR

---

## Ek Hizmetler

| Hizmet | Fiyat |
|--------|-------|
| WhatsApp entegrasyonu (WATI) | 500 EUR kurulum + 150 EUR/ay |
| GHL sync ekleme | 1.500 EUR kurulum + 300 EUR/ay |
| Ek agent | 800 EUR kurulum + 200 EUR/ay |
| KB güncelleme hizmeti | 300 EUR/ay |
| Acil destek (SLA 24h) | 500 EUR/ay ek |

---

## Müzakere Notları

- %20'ye kadar indirim: uzun dönem taahhüt (12 ay) veya referans verme karşılığında
- Pilot projeler mümkün: sadece 1 agent ile başla, büyüt
- Türk startup'ları için özel indirim: belirli koşullarda %15-20 startup indirimi
- Barter/partnership: Karşılıklı fayda sağlayacaksa değerlendirilebilir

## Kesinlikle Pazarlık Yapılmayacak

- "Çalışırsa öderim" modeli → kabul edilmez
- Saatlik ücret → çalışma şeklimiz değil
- Süresiz aylık bakım taahhüdü olmadan kurulum → önerilmez (sistem kopuk kalır)
