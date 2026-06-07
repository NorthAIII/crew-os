# PHASES — Proje Fazları (Özet)

**Amaç:** Tüm fazların genel durumunu göstermek
**Not:** Her fazın detayları `phases/PHASE-X.md` dokümanındadır.

---

## Faz Numaralandırma Kuralı (Just-in-Time)

Faz numarası faza **girildiğinde** atanır (discuss-phase) — değeri her zaman *Faz Durumu tablosundaki en büyük faz no + 1* (tablo boşsa 1). Gelecek fazlar **önceden numaralanmaz**; ileriye dönük plan versiyon düzeyinde (PRD/VERSIONS.md) + aşağıdaki numarasız "Sıradaki Fazlar" listesinde durur.

Faz numaraları **global, sürekli ve append-only**'dir — versiyon değişse bile sıfırlanmaz ve **hiçbir zaman yeniden numaralanmaz/kaydırılmaz**.

---

## Faz Durumu

> Bu tablo **yalnızca girilmiş fazları** içerir (discuss-phase başlamış: 🔄/✅/⚠️). Henüz girilmemiş fazlar numarasızdır ve "Sıradaki Fazlar" listesindedir.

| Faz | Konu | Milestone | Durum |
|-----|------|-----------|-------|
| _(henüz faza girilmedi — map-codebase ile yapı kuruldu, sıradaki adım PRD)_ | | | |

**Durum simgeleri:**
- 🔄 **Devam ediyor** — discuss-phase başladı (aktif faz)
- ✅ **Tamamlandı** — review-phase tamamlandı
- ⚠️ **Erken sonlandırıldı**

**Detaylar:** `phases/PHASE-X.md`

---

## Sıradaki Fazlar

> Yaklaşan faz konuları — **numarasız**. Faza girildiğinde (discuss-phase) buradan çıkar, numara alıp Faz Durumu tablosuna 🔄 olarak geçer.

- Şema dikişleri + rebrand temizliği — leads/meetings → Twenty'ye devir hazırlığı, `outreach_state` pointer, "Bunker" izlerini temizle
- Twenty entegrasyonu — Twenty self-host/cloud + istemci + lead import → Twenty + Hermes alıcıyı Twenty'den çeker
- Ops dashboard — onay kuyruğu (tek-tık) + Hermes aktivitesi + brifing (shadcn/ui + Tremor)
- Brifing canlı + dispatch executor'ları — günlük brifing cron + ICERIK/CRM dispatch
- Kiwi içi dogfood — gerçek Gmail/Anthropic/Cal.com, Kiwi lead'leri Twenty'ye, canlı outreach

<!-- KURAL: Bu liste YAKIN ufku tutar (örn. aktif versiyonun kalan fazları), uzak gelecek değil — uzak ileriye dönük plan PRD/VERSIONS.md'dedir. Numara YAZMA (numara faza girince damgalanır). Bir konu faza girince bu listeden silinir (mezuniyet — soft delete yasak: HTML comment/üstü çizili/"Önceki:" prefix yok). -->
<!-- NOT: VERSIONS.md feature→versiyon haritasını tekrar etme; burada faz konusu (geliştirme birimi) + milestone tutulur, feature listesi değil. -->
<!-- Sıradaki faz yoksa (proje/versiyon ucu) bu liste boş kalır. -->

---

## Faz Geçiş Notları

**Faz geçişinde yapılacaklar:**
1. Faz review'ını tamamla (`/devflow:review-phase N`)
2. Faz dokümanına retrospektif ve kalite kontrol sonuçlarını yaz
3. Milestone kriterlerini kontrol et
4. DURUM.md'yi güncelle
5. Tüm task'ların archive'da olduğunu doğrula
6. Sonraki fazı başlat (`/devflow:discuss-phase N+1`)

**Kural:** Bir seferde sadece 1 faz planlanır. Sonraki faz, mevcut faz tamamlandıktan sonra planlanır.

**Versiyon Sonu Kuralı:** Her versiyonun içerik fazları tamamlandıktan sonra sırasıyla iki sabit faz yürütülür: (1) Teknik Borç Kapatma Fazı, (2) Senaryo Testi Fazı. Sonra zorunlu `/devflow:prd-review`.

**Faz Mezuniyeti Kuralı:** PHASES.md kompakt kalır. Faz detayı/retrospektif `phases/PHASE-N.md`'dedir; buraya yazılmaz.

| Geçiş | Tarih | Not |
|--------|-------|-----|
| _(henüz faz geçişi yok)_ | | |

<!-- KURAL: Her geçiş için TEK satır + kısa not. Geçiş gerekçesi/detayı PHASE-N.md retrospektifindedir, burada tekrar edilmez. "Önceki:" prefix veya HTML comment ile detay yığma YASAK (CLAUDE.md → Doküman Disiplini). -->

---

**Son Güncelleme:** 2026-06-07 — map-codebase ile _dev/ yapısı kuruldu; faza henüz girilmedi, sıradaki adım PRD.

<!-- KURAL: Bu satır her güncellemede ÜZERİNE YAZILIR. "Önceki:" prefix ile kümülatif yığma YASAK (CLAUDE.md → Doküman Disiplini). -->
