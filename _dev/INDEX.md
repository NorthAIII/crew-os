# INDEX — Doküman Yol Haritası

**Amaç:** Hangi durumda hangi dokümanı okuyacağını bilmek

---

<!-- KURAL: INDEX iki tür kayıt tutar:
     1. İÇERİK DOKÜMANLARI (modules/, docs/, PRD içerik dosyaları, projeye özgü sabitler) → TEK TEK enumere edilir.
     2. SIRALI/ÖNGÖRÜLEBİLİR DOKÜMANLAR (tasks/, phases/) → TEK TEK enumere EDİLMEZ. Sadece klasör konumu ve isim deseni. -->
<!-- NOT: Tüm dokümanlar _dev/ klasöründedir. Aşağıdaki yollar _dev/ klasörüne göredir. -->

## Tüm Dokümanlar

> **CLAUDE.md** repo kökündedir (`/CLAUDE.md`) — Claude Code her oturum otomatik okur; oturum başlangıç protokolü + projeye özgü kurallar oradadır.

### Temel Dokümanlar (Her Oturum Başında OKU)

1. **OVERVIEW.md** — Proje kimliği, stack, amaç, kapsam
2. **INDEX.md** — Bu dosya (navigasyon haritası)
3. **DURUM.md** — Dashboard (aktif faz, aktif task, son ilerleme)
4. **MEMORY.md** — Proje hafızası index'i (öğrenim pointer'ları; detay `memory/<slug>.md`, lazy-load)

### Planlama Dokümanları (Planlama ve Review'da OKU)

5. **MODULE-MAP.md** — Modül ve feature haritası (özet/index)
6. **PHASES.md** — Faz durum özeti + sıradaki fazlar
7. **QUALITY.md** — Kalite eksenleri ve kontrol noktaları
8. **ILKELER.md** — Proje ilkeleri / yön

### Projeye Özgü Sabitler (Her Oturumda OKU)

| Doküman | İçerik |
|---------|--------|
| _(henüz yok — STYLE-GUIDE / TECH-STACK gerekince eklenecek)_ | |

### PRD Dokümanları (PRD Oturumlarında OKU)

| Doküman | İçerik |
|---------|--------|
| _(PRD henüz oluşturulmadı — `/devflow:prd` ile gelecek)_ | |

### Modül Dokümanları (İlgili Modül Gerektiğinde OKU)

| Doküman | Modül |
|---------|-------|
| `modules/M1-Cekirdek-Altyapi.md` | Auth, tenant, db, llm, worker |
| `modules/M2-Hermes-Outreach.md` | E-posta sekansı + yanıt sınıflama |
| `modules/M3-Brifing-Beyni.md` | Çok-ajan pipeline + autonomy + reflexion |
| `modules/M4-Twenty-Entegrasyonu.md` | CRM kaynağı; ajan okuma/yazma |
| `modules/M5-Ops-Dashboard.md` | Onay kuyruğu, aktivite, brifing UI |
| `modules/M6-Frida-Postiz.md` | İçerik üretimi + sosyal yayın |

### Faz Dokümanları (Aktif Faz OKU)

`phases/` klasöründe `PHASE-N.md` deseninde. Güncel faz listesi **PHASES.md**'de, aktif faz **DURUM.md**'de.

### Task Dokümanları (Task Çalıştırırken OKU)

- **tasks/TASKS-README.md** — Task sistemi kuralları
- `tasks/TASK-X.YY.md` — Aktif task; güncel task **DURUM.md**'de
- `tasks/archive/` — Tamamlanmış task'lar · `tasks/quick/` — Ad-hoc

### Bilgi Havuzu (İhtiyaca Göre)

| Doküman | İçerik |
|---------|--------|
| `docs/DECISIONS.md` | Önemli mimari ve tasarım kararları (build-vs-buy, Twenty kaynağı, lokal-önce vb.) |

---

## Senaryolar — Hangi Durumda Ne Oku?

> Bir `/devflow:` komutu çalışırken **yetkili kaynak o komutun kendi "Okunacak Dosyalar" bölümüdür**; çelişki olursa komut dosyası kazanır.

### SENARYO: PRD Oturumu (prd, prd-refine, prd-review)
1. Temel dokümanlar → 2. ILKELER.md → 3. `PRD/` altındaki tüm dokümanlar

### SENARYO: Kapsam Tartışması (Discuss Phase)
1. Temel dokümanlar → 2. ILKELER.md → 3. MODULE-MAP.md → 4. PHASES.md → 5. ilgili modül dokümanları → 6. aktif faz dokümanı → 7. önceki faz retrospektifi

### SENARYO: Teknik Araştırma (Research Phase)
1. Temel dokümanlar → 2. QUALITY.md → 3. ILKELER.md → 4. aktif faz dokümanı → 5. ilgili modül dokümanları → 6. docs/

### SENARYO: Faz Planlama (Plan Phase)
1. Temel → 2. MODULE-MAP → 3. aktif faz dokümanı → 4. modül dokümanları → 5. QUALITY → 6. ILKELER → 7. TASKS-README → 8. `templates/TASK.md`

### SENARYO: Task Çalıştırma
1. Temel → 2. projeye özgü sabitler → 3. TASKS-README → 4. QUALITY → 5. aktif task → 6. task'ın referans dokümanları

### SENARYO: Faz Review
1. Temel → 2. MODULE-MAP → 3. aktif faz dokümanı → 4. QUALITY → 5. PHASES → 6. fazın task'ları → 7. kaynak kod

---

## Hızlı Erişim

**DevFlow Dokümanları:** `_dev/`
**Kaynak Kod:** `/workspaces/crew-os/src/`
**Çalışan Uygulama:** `http://localhost:3000`

---

**Son Güncelleme:** 2026-06-07 — map-codebase ile _dev/ iskeleti ve modül dokümanları oluşturuldu.

<!-- KURAL: Bu satır her güncellemede ÜZERİNE YAZILIR. "Önceki:" prefix ile kümülatif yığma YASAK. -->
<!-- KURAL: Tamamlanmış fazların task arşiv listesini INDEX'e ekleme — `ls _dev/tasks/archive/` zaten görür. -->
