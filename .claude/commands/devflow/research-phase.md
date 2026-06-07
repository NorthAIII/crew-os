# DevFlow — Teknik Araştırma (Research Phase)

Bu komut faz için teknik araştırma yapmak ve bulguları kaydetmek için kullanılır. Kapsam tartışmasındaki kararlar araştırmayı yönlendirir.

**Kullanım:** `/devflow:research-phase [N]` — N = faz numarası (belirtilmezse DURUM.md'den aktif fazı al)

---

## Okunacak Dosyalar

### Oturum Başlangıç Protokolü (önce)
CLAUDE.md'deki Oturum Başlangıç Protokolü'nü uygula (OVERVIEW, INDEX, DURUM, MEMORY). Bu dosyalar aşağıda tekrarlanmaz.

### Komuta Özgü Ek Dosyalar

**Zorunlu (hepsini oku)**
1. `_dev/QUALITY.md` — yaklaşımların karşılaştırıldığı kalite eksenleri (Adım 2'de uygulanır)
2. `_dev/ILKELER.md` — Proje ilkeleri (yaklaşım seçimini yönlendirir)
3. Aktif faz dokümanı (`_dev/phases/PHASE-N.md`) — özellikle "Kapsam Tartışması" bölümünü oku

**Göreve Göre (araştırma konusuna göre oku)**
- Fazın modül dokümanları → MODULE-MAP.md'den bu fazın feature'larına bak, ilgili modülleri tespit et, `_dev/modules/MX-*.md` dosyalarını oku
- Mevcut teknik dokümanlar → INDEX.md'den araştırma konusuyla ilgili `_dev/docs/` dosyalarını tespit et ve oku (TECH-STACK, DATABASE, API vb.)
- `_dev/PHASES.md` → gerekirse oku (aktif faz DURUM'dan, kapsam PHASE-N'den gelir)

---

## Yapılacaklar

**Adım 0 — Protokol & Okuma Onayı (her şeyden önce):** Yukarıdaki "Okunacak Dosyalar"ı oku, sonra tek satırlık okuma-onayını yaz (kural → CLAUDE.md: "Protokol ve `/devflow:` Komutları Arasındaki İlişki" → Okuma onayı). Onay yazılmadan aşağıdaki adımlara başlama.

### 1. Araştırma Alanlarını Belirle

Faz kapsamı ve kapsam tartışmasındaki kararları analiz ederek araştırılması gereken konuları belirle:

**Tipik araştırma alanları:**
- **Stack/Kütüphane araştırması:** Kapsam tartışmasında belirlenen ihtiyaçlara uygun araç ve kütüphaneler
- **Mimari yaklaşımlar:** Feature'ların nasıl yapılandırılacağı, pattern'ler
- **Bilinen sorunlar ve tuzaklar:** Seçilen teknolojilerin yaygın hataları
- **Best practice'ler:** Benzer uygulamalarda kanıtlanmış yaklaşımlar
- **Performans ve ölçeklenebilirlik:** Seçilen yaklaşımın sınırları
- **Güvenlik:** Feature'a özgü güvenlik riskleri

### 2. Araştırmayı Yap

Her alan için:
1. Konuyu araştır
2. Alternatif yaklaşımları QUALITY.md'deki kalite eksenleri açısından karşılaştır
3. Önerisini gerekçesiyle belirle
4. Dikkat edilmesi gereken noktaları not al

**Kurallar:**
- Kapsam tartışmasındaki kararları baz al (mesela "kart layout" kararı varsa, kart component yaklaşımlarını araştır)
- Mevcut projede zaten kullanılan teknolojilerle uyumu göz önünde bulundur (OVERVIEW.md'deki stack)
- Sadece bu faz için gerekli olanları araştır, kapsamı aşma

### 3. Önemli Kararları Belirle

Araştırma sırasında ortaya çıkan karar noktalarını kullanıcıya sun:
- Birden fazla geçerli yaklaşım varsa seçenekleri sun
- Her seçeneğin artı/eksi yönlerini belirt
- Önerisini söyle ama kararı kullanıcıya bırak
- **ILKELER.md'ye göre öner:** Önerini projenin ilkeleriyle hizala (örn. kalıcılık önceliği → daha sağlam yaklaşıma eğil; öncelikli eksenler → o ekseni güçlendiren yaklaşımı öne çıkar). Bir yaklaşım bir ilkeyle çelişiyorsa bunu açıkça belirt.

### 4. Faz Dokümanını Güncelle

Araştırma tamamlandığında, faz dokümanına (`_dev/phases/PHASE-N.md`) "Araştırma Bulguları" bölümünü yaz:

```markdown
## Araştırma Bulguları

### Değerlendirilen Yaklaşımlar
- [Yaklaşım 1]: [Açıklama, artılar, eksiler]
- [Yaklaşım 2]: [Açıklama, artılar, eksiler]
- **Seçilen:** [Hangisi ve neden]

### Kullanılacak Araçlar/Kütüphaneler
- [Araç 1]: [Versiyon, ne için kullanılacak]
- [Araç 2]: [Versiyon, ne için kullanılacak]

### Dikkat Edilecekler
- [Tuzak/Risk 1]: [Nasıl kaçınılacak]
- [Tuzak/Risk 2]: [Nasıl kaçınılacak]

### Teknik Kararlar
- [Karar 1]: [Gerekçe]
- [Karar 2]: [Gerekçe]
```

**Tanımlayıcı kaynağını kaydet:** Araştırma bulgularında (özellikle "Dikkat Edilecekler") somut bir precondition tanımlayıcı — metric/uid/secret-slot/env-config anahtarı veya somut dosya/modül yolu — andığında, **nereden geldiğini** de yanına yaz: repoda zaten tanımlıysa tanım sitesi (`path`/sembol), bu fazda yaratılacaksa "yeni", dış sistemdeyse (vault slot, uzak dashboard) "dış". Yerini bilmiyorsan tahminle doldurma — hedefli bir `grep` ile bak, sonra kaydet (Çalışma Prensibi #11). Bu **kayıttır, doğrulama değil**: sen yalnız bildiğini işaretlersin, referansın gerçekle tutarlılığını verify-plan doğrular. Böylece research'te doğan tek bir tanımlayıcı N task'a akarken kaynağı bir kez burada sabitlenir — plan-phase kaynak-işaretini, verify-plan referans gerçeklik-kontrolünü buradan besler, her task'ta yeniden türetmez. Secret/env'de yalnız slot **adını** yaz, değeri asla.

### 4b. Faz Dokümanı Boyut Kontrolü (önleyici bölme)

"Araştırma Bulguları" faz dokümanının en hacimli bloklarından biridir; bu oturumda dokümanı belirgin büyütebilir. Faz **hâlâ aktifken** tek-okuma sınırını koru (detay: CLAUDE.md → Doküman Disiplini → Boyut ve Bölünme):

- `bash .claude/commands/devflow/scripts/doc-scan.sh _dev/phases/PHASE-N.md` çalıştır. Kırmızı çizgiye (~20k token) yaklaştıysa/aştıysa CLAUDE.md → Boyut ve Bölünme'ye göre teşhis + çöz: **gerçek büyüme** (araştırma detayı) → `PHASE-N-<slug>.md`'ye böl (parent özet+pointer tutar, içerik taşınıp silinir — kopya kalmaz, çocuk `← PHASE-N · <tip>` geri-linki alır, parent pointer listesine eklenir); **şişme** (yanlış-ev) → temizle.
- Yapısal bölme/temizlik **kullanıcıya önerilir, onayla uygulanır** — mekanik auto-split değil. Bu bir doküman-hijyen adımıdır, kaynak kodu değiştirmez.

### 5. Gerekirse docs/ Güncelle

Araştırmadan çıkan kalıcı bilgileri (veritabanı yapısı, API tasarımı vb.) ilgili `_dev/docs/` dokümanlarına yaz. Önemli kararları `_dev/docs/DECISIONS.md`'ye ekle (append-only; mevcut log okunmaz).

### 6. DURUM.md Güncelle

DURUM.md'deki **Adım** alanını `plan` olarak güncelle (araştırma tamamlandı, sıradaki adım planlama).

### 7. Git Commit & Push

Tüm doküman değişikliklerini commit & push yap:
```
docs(phase-N): research — technical research completed
```

### 8. Sıradaki Adımı Öner

```
✅ Araştırma tamamlandı. Bulgular faz dokümanına yazıldı.
📋 Sıradaki adım: /devflow:plan-phase N
   → Task yazımı için yeni bir oturum başlat.
```

---

## Önemli Kurallar

- Bu oturumda task yazılmaz — sadece araştırma yapılır
- Kapsam tartışmasındaki kararları referans al
- Önerilerini ILKELER.md ile hizala — ilkeyle çelişen yaklaşımı sessizce seçme, açıkça getir
- Araştırma bulgularını somut ve uygulanabilir tut (genel bilgi değil, bu projeye özgü)
- Precondition tanımlayıcılarının kaynağını bulguya not et (repoda-tanımlı→site, yeni, dış) — research kaydeder, verify-plan doğrular
- Karar gerektiren noktalarda kullanıcıya sor
