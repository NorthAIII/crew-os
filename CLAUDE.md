# Crew OS — Claude Code Talimatları

**Proje:** Agentic satış/ops işletim sistemi (Hermes outreach + brifing beyni + Twenty CRM + Frida). KiwiAI Lab iç kullanımı, ileride satılabilir.
**Repo:** `/workspaces/crew-os` · GitHub `https://github.com/NorthAIII/crew-os`
**DevFlow Dokümanları:** `/workspaces/crew-os/_dev/`

---

## DevFlow Nedir?

Bu proje DevFlow sistemiyle yönetilmektedir. DevFlow, slash command tabanlı bir proje yönetim sistemidir. Tüm geliştirme dokümanları `_dev/` klasöründedir. Komutlar `.claude/commands/devflow/` klasöründedir.

**Temel Felsefe:**
- Her oturum ayrı, context temiz kalır
- Task dokümanı detaylı, iş paketi küçük
- Az context = yüksek kalite
- Her şey kayıt altında

---

## Dil

Bu projenin çalışma dili Türkçe.

- **Kullanıcıyla Türkçe konuş** — tüm yanıtlar, açıklamalar ve sorular Türkçe.
- **DevFlow dokümanlarını Türkçe doldur** — `_dev/` altındaki tüm dokümanlar Türkçe.

> Tek istisna commit mesajlarıdır: açıklama İngilizce yazılır (→ Commit Convention).

---

## Oturum Başlangıç Protokolü

Her oturum başında MUTLAKA şu dokümanları oku:

1. `_dev/OVERVIEW.md` — Proje kimliği
2. `_dev/INDEX.md` — Doküman haritası
3. `_dev/DURUM.md` — Aktif durum (faz, task, ilerleme)
4. `_dev/MEMORY.md` — Proje hafızası **index'i** (pointer'lar; detay `_dev/memory/<slug>.md`, lazy-load)

**Eksik okuma yasağı:** Bu listede veya sonradan okunan herhangi bir `_dev/` dokümanında Read uyarı/hata verirse kör deneme yapma — `doc-scan.sh` + `grep` ile haritalayıp hedefli parçalı oku; o da çalışmıyorsa dur, kullanıcıya bildir. (Detay: Çalışma Prensipleri #10.)

**Memory Migration:** `_dev/MEMORY.md` yoksa template'ten oluştur. Local memory'de (`~/.claude/`) projeye özgü bilgi varsa her birini `_dev/memory/<slug>.md`'ye yaz ve index'e pointer ekle.

**Native memory yönlendirmesi:** Proje bilgisi native memory'de değil `_dev/`'de tutulur. Kurulum `kickoff-verify`, drift kontrolü `audit-docs`. **Not (bu proje):** Crew OS henüz Bunker OS workspace'inden geliştirildi; native memory o projeye ait + crew-os'a özel olmayan anılar içeriyor, bu yüzden redirect KURULMADI. crew-os kendi VS Code workspace'i olarak açıldığında redirect orada kurulmalı.

**Aktif task varsa** (DURUM.md'den öğren):
5. `_dev/tasks/TASKS-README.md` — Task sistemi kuralları
6. Aktif task dokümanı

**Projeye özgü sabit dokümanlar** (her oturumda oku):
- _(henüz yok — dashboard fazında STYLE-GUIDE eklenecek)_

Göreve göre ek dokümanlar gerekirse → INDEX.md'deki senaryolara bak.

### Protokol ve `/devflow:` Komutları Arasındaki İlişki

- **Öncelik:** Tüm `/devflow:` komutlarında bu protokol, komutun kendi "Okunacak Dosyalar" listesinden **önce** uygulanır. Komut listesi protokolün üstüne **ek** niteliktedir.
- **Eksik dosya kuralı:** Protokol listesindeki bir dosya henüz yoksa (ilk kurulum) atla. Dosya yokluğu hata değildir.
- **Tekrarsızlık kuralı:** Komut dosyaları bu dört dosyayı (`OVERVIEW`, `INDEX`, `DURUM`, `MEMORY`) kendi listesinde tekrar etmez.
- **Okuma onayı (görünür kapı):** Komutun ilk adımına geçmeden önce protokolü + komutun "Okunacak Dosyalar"ını uygula ve tek satırlık okuma-onayı yaz:
  `Okuma: OVERVIEW ✓ · INDEX ✓ · DURUM ✓ · MEMORY ✓ | <komuta özgü ek dosyalar> ✓`
  - Dosya yoksa `—` ile işaretle. Yarım okunduysa ✓ yazma — Çalışma Prensipleri #10'u uygula.
  - **`next` istisnası:** onay satırını hedef komut yazar. **Kapı dışı:** kurulum komutları (`map-codebase`, ilk-kickoff) ve oturum-sonu (`pause`/`double-check`/`prd-save`).

---

## Doküman Kuralları

**ÖNEMLİ:** Tüm geliştirme dokümanları `_dev/` klasöründedir. Projenin kendi dokümanlarıyla (README, docs/) KARIŞMAZ.

### Dokunulmaz Dokümanlar — çekirdek/sabit; rutin işte değiştirme:
- `_dev/tasks/TASKS-README.md` — DevFlow task-sistem çekirdek protokolü.

### Korumalı Dokümanlar — Değiştirmeden önce kullanıcıya bildir, onay al:
- `_dev/OVERVIEW.md` — Proje kimliği (yalnızca statik bilgi; dinamik durum DURUM.md'de).
- `_dev/ILKELER.md` — Proje ilkeleri (yön/öncelik; nadiren ve bilinçli değişir, prd/prd-review'da).

### Rutin Güncellenen Dokümanlar:
- `_dev/INDEX.md` — Yeni içerik dokümanı oluşturulduğunda.
- `_dev/DURUM.md` — Her task sonunda.
- Aktif task dokümanı — Her task sonunda.

---

## Doküman Disiplini

DevFlow dokümanları yaşayan dokümanlardır. Ekleme kadar **çıkarma da disiplinle** yapılır.

- **Soft delete yasaktır.** HTML comment'e sarma, "Önceki:"/"ESKİ:" prefix, üstü çizili etiket yasak. Eski bilgi gerçekten silinir (tarih git history'de).
- **KURAL yorumları silinmez.** Template'ten gelen `<!-- KURAL: … -->` yorumları yaşayan dokümanın yapısal kuralıdır, korunur.
- **"Önceki Güncelleme:" zinciri yasaktır.** Tek-değerli alanlar üzerine yazılır.
- **Mezuniyet yapılır.** Bilgi başka dokümana aktarıldıysa kaynaktan silinir (iki yerde tutmak = drift).
- **Bilginin doğru evi:** kararlar → `docs/DECISIONS.md`; yön/öncelik → `ILKELER.md`; kalite ekseni → `QUALITY.md`; aktif durum → `DURUM.md`; faz detayı → `phases/PHASE-N.md`; genel öğrenim/tuzak → `memory/<slug>.md`.
- **Boyut:** Her yaşayan doküman tek Read'de okunabilmeli; şişerse teşhis et (şişme→temizle / gerçek büyüme→böl). Ölçüm: `.claude/commands/devflow/scripts/doc-scan.sh`.

---

## Oturum Disiplini

- **Planlama Oturumu:** Faz kapsamı analiz edilir, task dokümanları oluşturulur. **Task çalıştırılmaz** — biter, kapanır.
- **Task Oturumu:** Tek task'e odaklanılır, bitirilir, kapanır. İkinciye geçilmez. Sıra: test → doküman → commit & push.
- **Faz Planlaması:** Bir seferde sadece 1 faz; sonraki ancak mevcut review'ı bitince.

---

## Çalışma Prensipleri

1. **Otonom çalış.** Task'ı al, tamamla, test et, commit at.
2. **Şüphede sor.** Belirsizlik/risk/karar gerektiren durumda danış.
3. **Halüsinasyon yapma.** Emin olmadığını yazma.
4. **Acele etme.** Sonuçları düşün.
5. **Varsayımları sorgula.** Kontrol et.
6. **Bilgi havuzunu güncel tut.** Önemli kararları `docs/DECISIONS.md`'ye yaz.
7. **Test atlanmaz.** Tamamlanma kriteri teste bağlı.
8. **Riskli komut çalıştırma.** Emin değilsen danış.
9. **`_dev/` izolasyonunu koru.**
10. **Hiçbir dosya yarım/atlanarak okunmaz.** Read truncate/PARTIAL görürsen: PARTIAL'ı işaretle → `doc-scan.sh` ile haritala → `grep -n` ile konumla → offset+limit ile kalanı tamamla → olmazsa dur ve bildir.
11. **Boşluk varsa önce araştır, sonra sor.** Bilmediğini grep/find/web ile araştır; hâlâ netse değilse sor.

---

## Task Tamamlanma Sırası (ATLANMAZ)

1. **Test** — çalıştır (yoksa yaz)
2. **Task Dokümanı** — oturum kaydı + durum
3. **DURUM.md ve Faz Dokümanı** — pointer + özet + faz tablosu
4. **MEMORY** (gerekirse) — beklenmeyen tuzak → `memory/<slug>.md` + index
5. **Archive** — biten task `tasks/archive/`'a
6. **Commit & Push** — kod + doküman tek commit
7. **Oturum Kapanır**

---

## Commit Stratejisi

**Bir oturum = bir commit** (varsayılan). Kod + doküman aynı commit'te; ayrı "docs: update" açma. Type prefix baskın değişikliğe göre.

## Commit Convention

```
feat(TASK-X.YY): kısa açıklama
fix(TASK-X.YY): kısa açıklama
refactor(TASK-X.YY): kısa açıklama
docs(TASK-X.YY): kısa açıklama
test(TASK-X.YY): kısa açıklama
chore(TASK-X.YY): kısa açıklama
```

- **Quick mode** (`/devflow:quick`): scope'suz (`fix: ...`).
- **Faz oturumu:** scope `phase-N`, açıklama `<aşama> — ...` (örn. `docs(phase-1): discuss — scope discussion completed`).
- Type prefix zorunlu; açıklama İngilizce, küçük harfle başlar, nokta ile bitmez.
- Commit mesajı sonuna: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## DevFlow Komutları

**PRD:** `prd`, `prd-refine`, `prd-save`, `prd-note`, `prd-review`
**Proje Başlatma:** `kickoff`, `kickoff-docs`, `kickoff-verify`, `map-codebase`
**Faz Döngüsü:** `discuss-phase`, `research-phase`, `plan-phase`, `verify-plan`, `run-task`, `verify-phase`, `review-phase`
**Yardımcı:** `next`, `quick`, `pause`, `resume`, `progress`, `double-check`, `audit-docs`, `step-by-step`, `guide-me`, `help`

---

## Dokunulmazlar

Bu dosyaları kullanıcı izni olmadan değiştirme:
- `.env` ve tüm sırlar (gitignore'da; koda asla gömme)
- `drizzle/*.sql` — üretilmiş migration'lar (şema değişimi `db:generate` ile)
- `src/db/schema.ts` — şema değişimi bilinçli + migration üreterek yapılır

---

## Projeye Özgü Kurallar

- **LLM = yalnızca Anthropic.** Haiku (routing/sınıflama) + Sonnet (içerik/strateji); model id'leri `src/lib/llm/models.ts` (env-override). Başka sağlayıcı (Groq/Gemini/OpenAI) EKLENMEZ.
- **TypeScript strict + ESM.** Next.js 15 App Router, React 19.
- **Drizzle snake_case.** Kısmi-unique index'li (`WHERE ... IS NOT NULL`) upsert'lerde `onConflictDoUpdate`'e `targetWhere` ŞART (yoksa "no matching constraint" 500).
- **Test = Node native runner** (`node --test`), DB'siz birim testler. Devralınan 44 test korunur; her yeni yetenek testini getirir.
- **KB = Postgres FTS** (vektör DB yok). Ölçeklenirse pgvector yolu açık.
- **Twenty & Postiz API-only.** Değiştirilmez/fork'lanmaz (AGPL); yalnızca REST/GraphQL/MCP'den tüketilir. Twenty = CRM'in tek gerçek kaynağı; Crew DB ikinci kopya tutmaz (pointer + ajan durumu).
- **Sıfır tenant-hardcode.** Marka/segment/gönderen/Cal.com/fiyat → `tenant_config`; koda gömme.
- **Lokal dev:** Node 24 + lokal Postgres 17 (db `crew_os`); Docker yok (Twenty/Postiz host Docker veya Cloud). `WORKER_ENABLED=false` lokalde.
- **Dashboard:** shadcn/ui + Tremor (MIT); low-code araç yok.

---

*Bu doküman statiktir. Dinamik bilgiler (aktif task, ilerleme) için `_dev/DURUM.md`'ye bak.*
