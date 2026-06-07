# TASKS SİSTEMİ — Kullanım Kılavuzu

**Amaç:** Task bazlı çalışma sistemi kuralları ve protokolü

---

## Task Sistemi Nedir?

Proje işleri küçük, bağımsız, otonom task'lara bölünür. Her task kendi dokümanında planlanır, çalıştırılır ve kayıt altına alınır.

**Avantajları:**
- Otonom çalışma: Task başlar, testler dahil tamamlanır, commit atılır
- Context izolasyonu: Sadece ilgili task ve dokümanlar okunur
- Temiz arşiv: Tamamlanan task → archive
- İzlenebilirlik: Her değişiklik kayıtlı

---

## Klasör Yapısı

```
_dev/tasks/
├── TASKS-README.md      ← Bu dosya (kurallar)
├── TASK-X.YY.md         ← Aktif/bekleyen task'lar (X=faz, YY=sıra)
├── quick/               ← Ad-hoc task kayıtları
└── archive/             ← Tamamlanan task'lar
```

Güncel task listesi ve aktif task bilgisi için: `DURUM.md`

---

## Task Numaralama

Format: `TASK-X.YY` — X = faz numarası, YY = task sırası. Her faz değiştiğinde YY sıfırlanır.

---

## Task Boyutu Felsefesi

**Task dokümanı detaylı, iş paketi küçük.** Az context = yüksek kalite.

Her task: tek bir feature'ın tek somut parçası · 1-3 dosya değişikliği · tek oturumda biter · bölünebiliyorsa bölünür. Task sayısının fazla olması sorun değil — her task küçük ve odaklı olsun.

---

## Lineer Çalıştırma Kuralı

Task'lar her zaman sırayla çalıştırılır. Paralel yok. DURUM.md'deki sıra numarası = çalıştırma sırası.

---

## Oturum Disiplini

**Her task oturumunda sadece 1 task.** Tamamlanınca oturum kapanır. **Planlama oturumunda task çalıştırılmaz.**

---

## Çalışma Protokolü

### Task Başlatma
1. DURUM.md'den aktif task'ı öğren
2. Bu dosyayı oku
3. Aktif task dokümanını oku
4. Task'ın "Referans Dokümanlar"ını oku
5. INDEX.md'den göreve göre ek dokümanlar

### Task Çalıştırma
Durmadan tamamla: alt görevler sırayla → her birinde test → son test → dokümanları güncelle → commit & push.

**Durma koşulları** (sadece bunlarda dur, kullanıcıya sor): teknik belirsizlik · kapsam belirsizliği · bağımlılık sorunu · çalışan kodu bozma riski · karar gereksinimi. Bunlar dışında durma; yanlış yapmaktansa sor.

### Task Tamamlama (sıra ATLANMAZ)
1. **Test:** Testleri çalıştır (yoksa yaz)
2. **Task Dokümanı:** Oturum kaydı, durum ✅, sonuç özeti
3. **DURUM.md + Faz Dokümanı:** Pointer güncelle, task özeti (son 2, eskileri sil), faz tablosu durumu
4. **Archive:** Task dokümanını `tasks/archive/`'a taşı
5. **Commit & Push:** Kod + doküman tek commit
6. **Oturum Kapanır**

---

## Durum Kodları

⬜ Bekliyor · 🔄 Devam ediyor · ⏸️ Duraklatıldı · ✅ Tamamlandı · 🔴 Bloke · ❌ İptal

---

## Commit Convention

> Format ve kurallar tek evde: **CLAUDE.md → Commit Convention** (faz task'ı `TASK-X.YY`, faz oturumu `phase-N`, quick mode scope'suz).

---

## Quick Task'lar

Faz döngüsü dışı ad-hoc işler `/devflow:quick` ile yapılır ve `_dev/tasks/quick/`'te izlenir. Scope yok, sadece type prefix. Archive'a taşınmaz.

---

## Özet Kurallar

1. Task = Detaylı, DURUM = Kısa
2. Tek task odağı
3. Test zorunlu
4. Commit zorunlu
5. Archive
6. Küçük task'lar
7. DURUM.md temiz (aktif faz + son 2 task)

---

**Son Güncelleme:** 2026-06-07
