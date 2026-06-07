# DevFlow — Plan Review ve Doğrulama (Verify Plan)

Bu komut plan-phase'den sonra, task dokümanlarını temiz context ile review etmek, hataları düzeltmek ve planı onaylatmak için kullanılır. Plan-phase'de yazılan task dokümanları aynı oturumda self-review edilir — bu komut ayrı oturumda, fresh context ile gerçek doğrulama yapar.

**Kullanım:** `/devflow:verify-plan [N]` — N = faz numarası (belirtilmezse DURUM.md'den aktif fazı al)

**Ön Koşul:** `/devflow:plan-phase` tamamlanmış olmalı.

---

## Okunacak Dosyalar

### Oturum Başlangıç Protokolü (önce)
CLAUDE.md'deki Oturum Başlangıç Protokolü'nü uygula (OVERVIEW, INDEX, DURUM, MEMORY). Bu dosyalar aşağıda tekrarlanmaz.

### Komuta Özgü Ek Dosyalar

**Zorunlu (hepsini oku)**
1. `_dev/tasks/TASKS-README.md` — task format / numaralama / boyut / lineer-çalıştırma kuralları (task'lar bu standarda karşı doğrulanır)
2. `_dev/MODULE-MAP.md`
3. `_dev/QUALITY.md`
4. Aktif faz dokümanı (`_dev/phases/PHASE-N.md`) — Kapsam Tartışması, Araştırma Bulguları ve Task Listesi bölümlerini oku
5. Bu fazın **tüm task dokümanları** (`_dev/tasks/TASK-N.*.md`) — hepsini oku

**Göreve Göre (kontrol sırasında oku)**
- Fazın modül dokümanları → MODULE-MAP.md'den bu fazın feature'larına bak, ilgili `_dev/modules/MX-*.md` dosyalarını oku (kabul kriterleri ve edge case'ler için)
- Yeni task oluşturma/bölme gerekirse → TASK template: `.claude/commands/devflow/templates/TASK.md`

---

## Yapılacaklar

**Adım 0 — Protokol & Okuma Onayı (her şeyden önce):** Yukarıdaki "Okunacak Dosyalar"ı oku, sonra tek satırlık okuma-onayını yaz (kural → CLAUDE.md: "Protokol ve `/devflow:` Komutları Arasındaki İlişki" → Okuma onayı). Onay yazılmadan aşağıdaki adımlara başlama.

### 1. Tüm Task Dokümanlarını Oku

Faz dokümanındaki task listesinden tüm task numaralarını al ve her birini oku. Bu adım kritik — temiz context ile tüm task'ları ilk kez okuyor olmalısın.

### 2. Mekanik Kontroller

Her task dokümanını şu açılardan kontrol et:

**a) Template Uygunluğu:**
- Zorunlu bölümler var mı? (Hedef, Alt Görevler, Etkilenen Dosyalar, Test Kriterleri, Tamamlanma Kriterleri)
- Opsiyonel bölümler gerekmediği halde doldurulmuş mu? (boş dolgu: "Yok", "Düşük risk" gibi)
- Format tutarlı mı?

**b) Referans ve Bağımlılık:**
- **Referans gerçeklik-kontrolü:** Somut referanslar (_dev dok refleri, kod yolları, Dikkat Noktaları'ndaki metric/uid/secret-slot/env-config tanımlayıcıları) gerçekle tutarlı mı? Yalnızca **zaten-var olması beklenenleri** doğrula — `YENİ` işaretli (büyük/küçük harf ve I/İ farkı önemsiz; niyeti tanı), önceki bir task'ın ürettiği (Adım 1'de tüm task'ları okudun, bu kümeyi kurabilirsin), bir output olarak eklenecek olanlar veya **aynı task'ın bu fazda yaratacağı dosya-dışı tanımlayıcılar (metric/uid/secret-slot/env-config)** muaftır — bu sonuncularda `YENİ` çapası yoktur (o işaret yalnız Etkilenen Dosyalar'dadır); bu fazda yaratılacaksa Dikkat Noktaları'nda "yeni" diye anılır, sen yalnız zaten-var beklenenleri grep'lersin. Kanal tipe göre: yol→`ls`/`grep`, in-repo tanımlayıcı→tanım sitesini `grep` (secret/env'de yalnızca slot **adı**, değer asla).
- Bağımlılıklar doğru mu? (TASK-X.03 → TASK-X.02'ye bağımlıysa, sıralama doğru mu?)
- Çapraz referanslar tutarlı mı?

**c) Yazım Kalitesi:**
- Typo ve tutarsızlıklar
- Alt görevler açık ve net mi?
- Test kriterleri somut ve doğrulanabilir mi?

**Mekanik sorunları doğrudan düzelt.** Bunlar için kullanıcıya sormaya gerek yok — doğru cevap belli. (İstisna: referans gerçeklik-kontrolünde bulunan **çakışma** mekanik değildir — Adım 4 onay raporuna gider; yalnızca _dev dok reflerindeki net typo mekanik kalır. Bkz. Önemli Kurallar.)

### 3. İçerik Kontrolleri

**a) Milestone Kontrolü:**
- Tüm task'ların toplamı milestone'u karşılıyor mu?
- Milestone'daki her kriter en az bir task'la eşleşiyor mu?
- Karşılanmayan kriter var mı?

**b) Gereksinim Kontrolü:**
- MODULE-MAP'teki feature kabul kriterleri task'larla örtüşüyor mu?
- Kapsam tartışmasındaki her karar en az bir task'a yansımış mı?
- Araştırma bulgularındaki "dikkat edilecekler" task'larda ele alınmış mı?
- Modül dokümanlarındaki edge case'ler task'larda karşılanmış mı?

**c) Kalite Kontrolü:**
- QUALITY.md'deki kalite eksenleri task'larda göz önünde tutulmuş mu?
- Test task'ları yeterli mi?
- Güvenlik, performans, hata yönetimi gibi kesişen konular planlanmış mı?

**d) Task'lar Arası Tutarlılık:**
- İki task aynı şeyi mi yapıyor? (çakışma)
- Task'lar arasında sahipsiz kalan alan var mı? (boşluk)
- Bir task çok büyük mü? (bölünmeli mi?)
- Bir task çok küçük mü? (bitişik task'la birleştirilmeli mi?)
- Sıralama mantıklı mı? (bağımlılık zinciri doğru mu?)
- Task'lar arası yaklaşım tutarlı mı? (bir task'ta A yolu, diğerinde çelişen B yolu yok mu?)

### 4. Sonuçları Raporla

Kullanıcıya iki kategoride rapor sun:

**Doğrudan düzeltilen mekanik sorunlar:**
```
🔧 Mekanik Düzeltmeler (X sorun düzeltildi):
- TASK-N.03: Eksik referans doküman eklendi
- TASK-N.07: Typo düzeltildi (alt görev 2)
- TASK-N.12: Bağımlılık sırası düzeltildi
```

**Onay gerektiren yapısal öneriler:**
```
📋 Yapısal Öneriler (kullanıcı onayı gerekli):

1. TASK-N.05 çok büyük — 2 ayrı task'a bölünmeli:
   - TASK-N.05a: [açıklama]
   - TASK-N.05b: [açıklama]
   Onaylıyor musun?

2. Milestone kriteri "[kriter]" hiçbir task'ta karşılanmıyor.
   Öneri: TASK-N.XX oluştur — [açıklama]
   Onaylıyor musun?

3. TASK-N.08 ve TASK-N.09 büyük ölçüde çakışıyor.
   Öneri: Birleştir — [açıklama]
   Onaylıyor musun?
```

**Sorun yoksa:**
```
✅ Plan review tamamlandı. X task dokümanı kontrol edildi, sorun bulunamadı.
```

### 5. Onaylanan Değişiklikleri Uygula

Kullanıcının onayladığı yapısal değişiklikleri uygula:
- Task dokümanlarını düzelt, böl veya birleştir
- Yeni task dokümanları oluştur (gerekirse)
- Faz dokümanındaki task listesini güncelle (yeni/değişen task'lar)
- Task numaralamayı düzelt (gerekirse)

### 6. DURUM.md Güncelle

- **Adım** alanını `task` olarak güncelle (plan review tamamlandı, sıradaki adım task çalıştırma)
- İlk task'ı aktif task olarak işaretle
- Task tablosunu güncelle (yeni/değişen task'lar varsa)

### 7. Git Commit & Push

Değişiklik yapıldıysa (düzeltme veya yapısal değişiklik) commit & push yap:
```
docs(phase-N): verify-plan — plan review completed
```

### 8. Sıradaki Adımı Öner

```
✅ Plan review tamamlandı. X task dokümanı kontrol edildi.
   Mekanik düzeltme: Y | Yapısal değişiklik: Z
📋 Sıradaki adım: /devflow:run-task
   → İlk task'ı (TASK-N.01) çalıştırmak için yeni bir oturum başlat.
```

---

## Önemli Kurallar

- Tüm task dokümanlarını baştan oku — plan-phase'den kalan context'e güvenme
- Mekanik sorunları doğrudan düzelt, yapısal değişikliklerde kullanıcıya danış
- **Referans gerçeklik-kontrolü güvenliği:** Boş grep tek başına bulgu değildir (Prensip #11) — tanım sitesinde açıkça farklı bir literal (rename) varsa bulgudur. Greplenemeyeni veya repo-dışını (vault slot, uzak dashboard metriği) **"doğrulanamadı"** diye işaretle; in-repo proxy'yi (.env.example) otorite yerine koyma, uydurma. Referans çakışması **mekanik düzeltme değildir** → Adım 4 onay raporuna gider; yalnızca _dev dok reflerindeki net typo mekanik kalır.
- Bu oturumda task çalıştırılmaz — sadece plan review ve düzeltme
- Yeni task oluşturulacaksa template'e uygun yaz: `.claude/commands/devflow/templates/TASK.md`
- Task bölme/birleştirme sonrası numaralamayı ve bağımlılıkları kontrol et
