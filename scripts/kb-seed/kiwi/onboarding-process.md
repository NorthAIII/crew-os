# KiwiAI Lab — Müşteri Onboarding Süreci

## Genel Bakış

Bir müşteriyle anlaşmadan sistemi teslim etmeye kadar geçen sürecin adım adım açıklaması.

---

## ADIM 1: Discovery Call (Gün 0)

**Süre:** 30 dakika
**Platform:** Google Meet veya Zoom (Cal.com linki ile rezerve edilir)
**Amaç:** Müşterinin nerede takıldığını anlamak

**Discovery Call'da sorulacak sorular:**
1. Şu an ne kadar lead alıyorsunuz? Nereden geliyor?
2. Lead takibini nasıl yapıyorsunuz? (Manuel, Excel, CRM?)
3. Kaç kişi satış yapıyor? Zamanlarının ne kadarı outreach'e gidiyor?
4. Sosyal medya içeriğini kim üretiyor? Ne sıklıkla?
5. Zaten kullandığınız araçlar var mı? (GHL, Notion, web sitesi?)
6. 3 ay sonra neyin farklı olmasını istiyorsunuz?

**Call sonrası:** İçinizde ne yapabileceğinizi değerlendirin. Emin değilseniz 24 saat içinde "düşünüyorum" mesajı atın.

---

## ADIM 2: Öneri Hazırlama (Gün 1-3)

**Teslim edilecek:** 1 sayfalık Notion veya PDF
**İçerik:**
- "Anladığımız problem" (müşterinin ağzından)
- "Önerdiğimiz çözüm" (hangi agent'lar, hangi entegrasyonlar)
- "Beklenen sonuçlar" (kaç saat tasarruf, otomasyon oranı tahmini)
- Fiyat ve zaman çizelgesi
- Sonraki adım (anlaşma imzalama)

**Fiyat görüşmesi:** Öneri belgesi gönderilmeden ÖNCE kısa bir call ile sözlü fiyat verin.
Yazılı belgeden önce müşteriyle hizala — sürpriz önler.

---

## ADIM 3: Anlaşma (Gün 3-5)

**Anlaşma şablonu:** Basit, 1-2 sayfa
**Şunları içermeli:**
- Kapsam (hangi agent'lar, hangi entegrasyonlar dahil, neler hariç)
- Zaman çizelgesi (başlangıç, teslim tarihleri)
- Ödeme planı: %50 başlangıç, %50 teslimde (önerilen)
- Değişiklik talepleri (kapsam dışı = ek ücret)
- Aylık bakım şartları

**Ödeme alınmadan BUILD BAŞLAMAZ.**

---

## ADIM 4: Erişim & Bilgi Toplama (Gün 5-7)

Müşteriden alınacak bilgiler:
- Kullanacakları email hesabı (Instantly.ai için)
- Cal.com hesabı (veya biz kurarız)
- Slack workspace daveti (veya biz kurarız)
- Mevcut CRM erişimi (eğer entegre edilecekse)
- Şirkete özel bilgiler (hizmetler, SSS, fiyatlar — KB için)
- Logo, renk paleti (web sitesi varsa)

**Altyapı kararları:**
- VPS: Müşterinin kendi sunucusunda mu yoksa bizim VPS'imizde alt-alan adı olarak mı?
- Önerilen: Müşteri için ayrı VPS (aylık bakım ücretine dahil)

---

## ADIM 5: Build (Gün 7-28)

**Hafta 1:** Temel pipeline (Lead Agent + DB + Slack)
**Hafta 2:** Diğer agent'lar + KB doldurma
**Hafta 3:** Test + hata düzeltme
**Hafta 4:** Teslim hazırlığı + eğitim

**Müşteriyle iletişim:** Haftada 1 kez kısa durum güncelleme (Slack mesajı yeterli).
Mid-build revizyon toplantısı (gün 10-12 civarı) — müşteriyi döngüde tut.

---

## ADIM 6: Teslim & Eğitim (Gün 28-30)

**Teslim toplantısı:** 60-90 dakika
- Sistemin canlı demosu
- "Bu nasıl çalışır" Loom videosu kaydı (6-10 dk)
- Runbook teslimi (ne yapılırsa ne olur, nasıl restart edilir)
- Acil iletişim yöntemi

**Eğitim konuları:**
- Lead nasıl sisteme girer
- Slack bildirimlerini nasıl okur
- Sosyal medya içeriğini nasıl onaylar
- Sistem durumunu nereden kontrol eder

---

## ADIM 7: Aylık Bakım (Devam Eden)

**Aylık bakım kapsamı:**
- Sistem izleme (container'lar çalışıyor mu, hata var mı)
- Instantly.ai warm-up takibi ve kampanya ayarları
- Qdrant KB güncelleme (yeni hizmet/ürün eklendikçe)
- Aylık performans raporu (Slack'e)
- Küçük değişiklikler (prompt güncellemesi, yeni entegrasyon vb.)

**Kapsam dışı (ek ücret):**
- Yeni agent ekleme
- Platform değişimi (başka CRM'e geçiş)
- Büyük kapsam değişiklikleri

---

## Sık Sorulan Müşteri Soruları

**"Sistem çalışmazsa ne olur?"**
→ Aylık bakım kapsamında izliyoruz. Problem olunca biz görürüz, haber veririz ve çözeriz.

**"Verilerimi nerede saklıyorsunuz?"**
→ Sizin için ayrı bir VPS'e (veya bizim VPS'imize izole partition) kurulur. Veriler sizin.

**"Sistemi kendi başıma yönetebilir miyim?"**
→ Eğitim sonrası temel kullanımı yapabilirsiniz. Teknik değişiklikler için bize gelirsiniz.

**"Kaç ayda geri dönüşü olur?"**
→ Lead takip ve outreach için genellikle 60-90 gün içinde ölçülebilir sonuç görülür.
