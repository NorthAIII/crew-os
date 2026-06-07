# DevFlow — Task Çalıştır (Run Task)

Bu komut sıradaki task'ı otonom olarak çalıştırır ve tamamlar. Her oturumda yalnızca 1 task çalıştırılır.

**Kullanım:** `/devflow:run-task` — DURUM.md'den sıradaki task'ı otomatik alır

---

## Okunacak Dosyalar

### Oturum Başlangıç Protokolü (önce)
CLAUDE.md'deki Oturum Başlangıç Protokolü'nü uygula (OVERVIEW, INDEX, DURUM, MEMORY). Bu dosyalar aşağıda tekrarlanmaz.

### Komuta Özgü Ek Dosyalar

**Zorunlu (hepsini oku)**
1. `_dev/tasks/TASKS-README.md` — çalışma kuralları
2. `_dev/QUALITY.md` — kod yazarken göz önünde tutulacak kalite eksenleri (Adım 2'de uygulanır)
3. Aktif task dokümanı (`_dev/tasks/TASK-X.YY.md` — DURUM.md'deki task numarasından bul)

**Göreve Göre (task dokümanından belirle)**
- Task dokümanının "Referans Dokümanlar" bölümünde listelenen `_dev/modules/` ve `_dev/docs/` dosyalarını oku
- CLAUDE.md'deki "Projeye özgü sabit dokümanlar" listesindeki dosyaları oku (STYLE-GUIDE vb.)

---

## Yapılacaklar

**Adım 0 — Protokol & Okuma Onayı (her şeyden önce):** Yukarıdaki "Okunacak Dosyalar"ı oku, sonra tek satırlık okuma-onayını yaz (kural → CLAUDE.md: "Protokol ve `/devflow:` Komutları Arasındaki İlişki" → Okuma onayı). Onay yazılmadan aşağıdaki adımlara başlama.

### 1. Task'ı Oku ve Anla

Task dokümanından:
- Hedef: Ne yapılacak?
- Alt görevler: Adım adım ne yapılacak?
- Test kriterleri: Nasıl doğrulanacak?
- Referans dokümanlar: Hangi ek dokümanlar okunmalı?

### 2. Kodu Yaz

Task dokümanındaki alt görevleri sırayla uygula:
- Her alt görevi tamamla
- Kod yazarken QUALITY.md eksenlerini göz önünde bulundur (güvenlik, hata yönetimi vb.)
- Task dokümanındaki dikkat noktalarına (araştırma bulguları, edge case'ler) uy
- Memory'deki "Süreç Disiplinleri"ni gözet (varsa) — proje retrolarından çıkan icra/closure kuralları (örn. selector değişiminde e2e taraması) burada uygulanır

### 3. Testleri Çalıştır

- Mevcut testler varsa çalıştır
- Task'a özgü test gerekiyorsa yaz ve çalıştır
- Test kriterleri karşılanmalı

### 4. Task Dokümanını Güncelle

Task dokümanının **Oturum Kayıtları** bölümüne `.claude/commands/devflow/templates/TASK.md` yapısına uygun bir oturum kaydı ekle — yapı template'te tanımlıdır, burada tekrarlanmaz (tek-ev). Pause/devam olasılığına karşı **"Son Yaklaşım"** ve **"Sonraki Adım Detayı"** alanlarını doldurmaya özen göster.

Task tamamlandıysa durumunu "✅ Tamamlandı" olarak güncelle.

### 5. DURUM.md ve Faz Dokümanını Güncelle

**DURUM.md:**
- "Son Güncelleme" satırını **üzerine yaz** (tek satır, max ~250 char) — "Önceki:" prefix ile yığma yasak
- Tamamlanan task'ın durumunu güncelle
- Sıradaki task'ı aktif task olarak işaretle (varsa)
- **Adım alanını ilerlet:** Fazda bekleyen task varsa `task`'ta bırak; **fazdaki tüm tasklar tamamlandıysa `verify` yap** (sıradaki adım verify-phase). Böylece DURUM sıradaki adımın tek yetkili kaynağı olur — diğer döngü komutlarıyla tutarlı.
- Task özetlerini güncelle — DURUM'un KURAL'ındaki sınır kadar tut, eski özetler **gerçekten silinir** (HTML comment'e sarma, "Önceki:" prefix yasak)

**Faz Dokümanı (`_dev/phases/PHASE-X.md`):**
- Task Listesi tablosundaki ilgili task'ın Durum sütununu güncelle (⬜ → ✅ veya 🔄)

> Doküman Disiplini tam metni: CLAUDE.md → Doküman Disiplini.

### 6. MEMORY Güncelle (Gerekirse)

Task sırasında **proje genelinde geçerli** beklenmeyen bir tuzak, workaround veya öğrenim keşfedildiyse memory'ye ekle: `_dev/memory/<slug>.md` dosyasını oluştur (aynı konu zaten varsa mevcudu güncelle) ve `_dev/MEMORY.md` index'ine ilgili kategori altında pointer ekle/güncelle. Her task'ta güncelleme zorunlu değil — sadece kayda değer bir şey varsa. (Memory sistemi detayı: MEMORY.md → Memory Sistemi.)

> **Yanlış-ev uyarısı:** Task icrasına özgü teknik nüanslar (araç davranışı, bu task'a özgü framework bug'ı vb.) memory'ye değil — bu task'ın **faz retrospektifine** (`phases/PHASE-N.md`) aittir, faz sonunda review-phase tarafından oraya yazılır. Memory yalnızca **proje genelinde geçerli** çapraz öğrenimler içindir. (Detay: MEMORY.md → YASAK içerik.)

### 7. Archive (Task Tamamlandıysa)

Task tamamlandıysa `_dev/tasks/archive/` klasörüne taşı.

### 8. Git Commit & Push

Tüm değişiklikleri (kod + doküman güncellemeleri + archive) tek commit'te gönder.

> Commit mesajı formatı ve kuralları: CLAUDE.md → Commit Convention. Faz task'ları için scope = `TASK-X.YY`.

### 9. Sıradaki Adımı Öner

**Sonraki task varsa:**
```
✅ TASK-X.YY tamamlandı.
📋 Sıradaki adım: /devflow:run-task
   → Sonraki task'ı (TASK-X.ZZ) çalıştırmak için yeni bir oturum başlat.
   → Kalan task sayısı: Y
```

**Tüm task'lar tamamlandıysa:**
```
✅ TASK-X.YY tamamlandı. Fazdaki tüm task'lar tamamlandı!
📋 Sıradaki adım: /devflow:verify-phase N
   → Kullanıcı kabul testini yapmak için yeni bir oturum başlat.
```

---

## Otonom Çalışma Kuralları

Task'ı aldığında durmadan tamamla. Ancak şu durumlarda dur ve kullanıcıya sor:
- **Teknik belirsizlik:** İki veya daha fazla geçerli yaklaşım var
- **Kapsam belirsizliği:** Task'ın sınırları net değil
- **Bağımlılık sorunu:** Gerekli dosya, API veya servis hazır değil
- **Risk:** Değişiklik mevcut çalışan kodu bozabilir
- **Karar gereksinimi:** Tasarım, mimari veya iş kuralı kararı

Bunlar dışında durma, devam et. Yanlış yapmaktansa sormaktan çekinme. Riskli komutlar çalıştırmaktan kaçın.

---

## Önemli Kurallar

- Her oturumda yalnızca 1 task — ikinciye geçme
- Test atlanmaz — her task'ın tamamlanma kriteri teste bağlı
- Commit atlanmaz — her task sonunda commit & push
- Task dokümanını ve DURUM.md'yi mutlaka güncelle
- Task bittiyse archive'a taşı
- Kullanıcı versiyonu erken sonlandırmak isterse: mevcut değişiklikleri WIP commit ile kaydet (`chore: WIP — early termination at [kısa açıklama]`), oturumu kapat. Kullanıcıyı `/devflow:prd-review` komutuna yönlendir — arşivleme ve değerlendirme orada yapılacak.
