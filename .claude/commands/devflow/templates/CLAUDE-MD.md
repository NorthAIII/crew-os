# [PROJE_ADI] — Claude Code Talimatları

**Proje:** [Kısa proje açıklaması]
**Repo:** `[REPO_YOLU]`
**DevFlow Dokümanları:** `[REPO_YOLU]/_dev/`

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
4. `_dev/MEMORY.md` — Proje hafızası **index'i** (birikmiş öğrenimlerin pointer'ları; detay `_dev/memory/<slug>.md` dosyalarında, gerekince lazy-load edilir)

**Eksik okuma yasağı:** Bu listede veya sonradan okunan herhangi bir `_dev/` dokümanında Read uyarı/hata verirse kör deneme yapma — `doc-scan.sh` + `grep` ile haritalayıp hedefli parçalı oku; o da çalışmıyorsa dur, kullanıcıya bildir, yardım iste — yarım okuyup veya atlayarak devam etme. (Detay: Çalışma Prensipleri #10.)

**Memory Migration:** `_dev/MEMORY.md` yoksa template'ten oluştur (index formatı). Claude Code'un local memory'sinde (`~/.claude/`) projeye özgü bilgi varsa (teknik tuzaklar, tercihler, öğrenimler vb.) her birini `_dev/memory/<slug>.md` dosyasına yaz ve MEMORY.md index'ine pointer ekle. Böylece tüm proje bilgisi repo içinde kalır. (Memory sistemi detayı: MEMORY.md → Memory Sistemi.)

**Native memory yönlendirmesi:** Proje bilgisi native (yerleşik) memory'de değil `_dev/`'de tutulur; bunu kalıcı kılmak için projenin native memory index'ine bir yönlendirme yazılır — kurulumunu/yenilemesini `kickoff-verify`, drift kontrolünü `audit-docs` yapar. **Değişmez kural:** native'e yönlendirme yazılmadan önce orada bilgi varsa ÖNCE `_dev/memory/`'ye taşınır (taşımadan üzerine yazma yok). Bu, DevFlow'un repo dışına yazdığı **tek** şeydir (bilinçli harness entegrasyonu); native memory proje-bazlı olduğu için içeriği bu projeye aittir.

**Aktif task varsa** (DURUM.md'den öğren):
5. `_dev/tasks/TASKS-README.md` — Task sistemi kuralları
6. Aktif task dokümanı

**Projeye özgü sabit dokümanlar** (her oturumda oku):
- [PROJEYE_ÖZGÜ — örn: _dev/STYLE-GUIDE.md, _dev/ISLEYIS-VE-KURALLAR.md]

Göreve göre ek dokümanlar gerekirse → INDEX.md'deki senaryolara bak.

### Protokol ve `/devflow:` Komutları Arasındaki İlişki

- **Öncelik:** Tüm `/devflow:` komutlarında bu protokol, komutun kendi "Okunacak Dosyalar" listesinden **önce** uygulanır. Komut listesi protokolün üstüne **ek** niteliktedir, yerine geçmez.
- **Eksik dosya kuralı:** Protokol listesindeki bir dosya henüz yoksa (ilk kurulum senaryoları — örn. `/devflow:prd` ilk oturumu, `/devflow:kickoff`) atla. Dosya yokluğu hata değildir, mevcut olanlar okunur.
- **Tekrarsızlık kuralı:** Komut dosyaları bu protokoldeki dört dosyayı (`OVERVIEW.md`, `INDEX.md`, `DURUM.md`, `MEMORY.md`) kendi "Okunacak Dosyalar" listesinde tekrar etmez. Komutlar yalnızca **komuta özgü ek** dosyaları listeler.
- **Okuma onayı (görünür kapı):** Komutun "Yapılacaklar" listesindeki **ilk adıma geçmeden önce** protokolü + komutun "Okunacak Dosyalar" listesini uygula ve **tek satırlık okuma-onayı** yaz; her zorunlu dosyayı tek tek işaretle:
  `Okuma: OVERVIEW ✓ · INDEX ✓ · DURUM ✓ · MEMORY ✓ | <komuta özgü ek dosyalar> ✓`
  - Dosya **yoksa** (ilk kurulum senaryosu) `—` ile işaretle (`OVERVIEW —`); yokluk hata değildir.
  - Dosya **yarım/parçalı** okunduysa (Read truncate/PARTIAL) ✓ **yazma** — Çalışma Prensipleri #10'u uygula (doc-scan + hedefli parçalı oku), tam okunmadan onaylama; çözülemiyorsa dur ve kullanıcıya bildir.
  - Onay satırı yazılmadan komutun ilk adımına geçilmez. **`next` istisnası:** yalnız DURUM okuyup hedef komuta devreder; onay satırını **hedef komut** yazar. **Kapı dışı komutlar:** (a) protokol uygulamayan kurulum komutları (`map-codebase`, ilk-kickoff modu) — orada okunacak protokol dosyası yoktur; (b) oturum-sonu komutları (`pause`, `double-check`, `prd-save`) — ana komut protokolü zaten uygulamıştır, bunlar protokolü tekrar tetiklemez.

---

## Doküman Kuralları

**ÖNEMLİ:** Tüm geliştirme dokümanları `_dev/` klasöründedir. Projenin kendi dokümanlarıyla (README.md, docs/ vb.) KARIŞMAZ. `_dev/` izolasyonunu her zaman koru.

### Dokunulmaz Dokümanlar — çekirdek/sabit; rutin işte değiştirme:
- `_dev/tasks/TASKS-README.md` — DevFlow task-sistem **çekirdek protokolü**. "Dokunulmaz" = bu protokolün gövdesini yeniden yazma/silme (drift koruması); "hiçbir şey eklenemez" demek değil. Proje-özel süreç disiplini eklemek istiyorsan buraya değil, memory'nin "Süreç Disiplinleri" kategorisine yaz (→ Doküman Disiplini → Bilginin Doğru Evi).
- [PROJEYE_ÖZGÜ_SABİT_DOKÜMANLAR]

> **Bayatlama notu:** Statik/korumalı dokümanlar (yukarıdaki sabitler, OVERVIEW) rutin işte değişmez ama tam da hiç dokunulmadığı için zamanla gerçeklikten kopabilir (sessiz bayatlama). Çözüm dokunmamak değil, **bilinçli mutabakat**: `audit-docs` (ve versiyon sonu prd-review önerisi) gerçeklik-drift'ini tarar, bulguyu **açık onayınla** günceller. ILKELER değer/yön-temellidir — bayatlaması audit gerçeklik-mutabakatıyla değil, prd-review'da deneyimle bilinçli yeniden değerlendirmeyle ele alınır.
>
> **Tarihsel/append-only doküman kuralı:** `_dev/tasks/archive/*`, PHASES.md'de ✅ işaretli `_dev/phases/PHASE-N.md`, `_dev/docs/DECISIONS.md`, `_dev/tasks/TASKS-README.md` için **içerik dondurulur** ama **biçim güncellenebilir**. audit yalnızca **içerik-koruyan reformat** yapar (yeni template yapısına hizalama); anlam, kayıt ve sıra korunur; raporda **"tarihsel reformat"** olarak işaretlenir; açık onayla uygulanır. DECISIONS'a yeni karar / `Superseded` etiketi audit'in işi değildir (`review-phase` / `prd-review`); audit yalnızca çelişki/drift fark ederse raporlar. TASKS-README'de çekirdek protokole hizalayan **protokol-migration** meşrudur (içerik-koruyan). Bunların dışında tarihsel dokümanın anlamına/sırasına dokunulmaz.

### Korumalı Dokümanlar — Değiştirmeden önce kullanıcıya bildir, onay al:
- `_dev/OVERVIEW.md` — Proje kimliği (nadiren değişir). **Yalnızca statik bilgi** içerir (kimlik, stack, amaç, kapsam); dinamik bilgi (aktif faz/task, ilerleme, faz numarası) buraya yazılmaz — onların evi DURUM.md'dir.
- `_dev/ILKELER.md` — Proje ilkeleri (yön/öncelik; nadiren ve bilinçli değişir). Doğal güncelleme noktaları prd/prd-refine/prd-review (zaten interaktif). Karar-şekillendiren diğer fazlarda (kickoff/discuss/research/plan) **okunur ve önerileri yönlendirir ama sessizce değiştirilmez** — bir ilkenin değişmesi gerekiyorsa kullanıcıya getir. Yalnızca yön/öncelik tutar; somut teknik kural buraya değil "Projeye Özgü Kurallar"a, değerlendirme ekseni QUALITY'ye gider.

### Rutin Güncellenen Dokümanlar:
- `_dev/INDEX.md` — Yeni **içerik dokümanı** (modül, docs, PRD içerik, projeye özgü sabit) oluşturulduğunda güncelle. Task/faz gibi sıralı dokümanlar INDEX'e enumere edilmez.
- `_dev/DURUM.md` — Her task sonunda güncelle
- Aktif task dokümanı — Her task sonunda güncelle

---

## Doküman Disiplini

DevFlow dokümanları yaşayan dokümanlardır — bir bilgiyi sildiğinde tarih kaybolmaz, git history zaten her şeyi kayıt altında tutar. Bu yüzden ekleme kadar **çıkarma da disiplinle yapılır.** Aksi halde dokümanlar kümülatif olarak şişer, okunabilirlik düşer ve güncel bilgi geçmiş bilginin altında kaybolur.

### Çıkarma Disiplini

- **Soft delete yasaktır.** Yumuşak silme yöntemleri yasak: HTML comment'e sarma (`<!-- removed -->`, `<!-- legacy-... -->`), "Önceki:" / "ESKİ:" prefix'i, üstü çizili (`~~...~~`) etiketi. Eski bilgi gerçekten silinir — tarih git history'de zaten kayıt altındadır, dokümanı şişirmenin anlamı yoktur.
- **KURAL yorumları silinmez.** Template'ten gelen `<!-- KURAL: … -->` yerinde-disiplin yorumları yaşayan dokümanın parçasıdır ve o dokümanın yapısal kuralının **tek kaynağıdır** (audit bunları ground-truth alır). Doldurulan `[placeholder]` ve `<!-- OPSİYONEL -->` strip-işaretleri hariç korunur — yukarıdaki soft-delete yasağı içeriği *gizleyen* yorumlar içindir; KURAL yorumu *aktif disiplin kuralıdır*, sökülmez.
- **"Önceki Güncelleme:" zinciri yasaktır.** "Son Güncelleme" gibi **tek-değerli** alanlar her güncellemede üzerine yazılır. Önceki değeri "Önceki:" prefix'iyle koruma refleksi yasak — bu refleks bir paragrafa 10-15 oturum izi yığıp 4000+ karakterlik tek satır yaratır.
- **Mezuniyet yapılır.** Bir bilgi başka dokümana aktarıldıysa (örn. SESSION-NOTES'tan PRD'ye, DURUM'dan tamamlanmış PHASE'a) **kaynak dokümandan silinir** — bir dokümanı alt-dokümanlara **bölerken de** geçerli: çıkarılan içerik parent'tan silinir (→ Boyut ve Bölünme). İki yerde tutmak hem bilgi tekrarıdır hem de drift kaynağıdır — biri güncellenir, diğeri unutulur.

### Tarih Koruma Gerekçesi Değildir

Yaşayan bir dokümanda (MEMORY, DURUM, MODULE-MAP, modül dokümanları, vb.) bir bilginin **tarih yazılı olması** onu koruma gerekçesi değildir.

Bilgi artık geçersiz veya çelişiyorsa **silinir/güncellenir**, tarihinden bağımsız. "8 ay önce yazılmıştı, kalsın" düşüncesi yanlıştır — yaşayan doküman güncel olmalı.

Tarihsel kayıt için arşivlenmiş task dokümanları, tamamlanmış faz dokümanları ve `DECISIONS.md` (append-only) vardır; yaşayan dokümanlar değil.

### Format ve Sıkıştırma

- **Paragrafları doğru böl.** Uzun bir mantıksal birimi tek satıra sıkıştırma. Markdown'da boş satır = yeni paragraf; her paragraf bir tek düşünceyi/birimi taşır.
- **3+ farklı düşünceyi tek paragrafta birleştirme.** Geçişler, listeler, farklı bağlamlar kendi satırına/paragrafına ayrılır.
- **Çok uzun bir düz-metin satırı işaret fişeğidir.** Tablo, code block ve uzun URL muaftır. Tek bir tutarlı paragraf uzun olabilir — asıl sorun 3+ ayrı düşüncenin tek satıra sıkışması ya da bir alanın oturum-oturum kümülatif yığılmasıdır (örn. 4000+ karakterlik "Son Güncelleme" satırı). `doc-scan.sh` bu satırları mekanik işaretler (Boyut ve Bölünme'de tam yol); işaret "buraya bak"tır, mahkûmiyet değil.

### Boyut ve Bölünme

Her yaşayan doküman **tek seferde okunabilir** olmalı — tek bir Read çağrısıyla, parçalı okumaya gerek kalmadan. Bu, Çalışma Prensipleri #10'daki parçalı-okuma kuralının **önleyici eşidir**: dokümanı baştan parçalı okuma gerektirmeyecek boyutta tut.

- **Asıl ölçüt token/toplam boyut, satır sayısı değil.** Birkaç çok uzun satır bile token bütçesini patlatıp tek-okumayı bozabilir. Ölçmek için `.claude/commands/devflow/scripts/doc-scan.sh` çalıştır — dokümanı **okumadan** satır/karakter/token/uzun-satır raporlar, eşik aşanları işaretler. Rehber eşikler (mahkûmiyet değil): ~6k token rahatlık bayrağı, ~20k token kırmızı çizgi (tek-okuma riski).
- **Eşik aşıldığında "idare eder" yoktur — teşhis et, çöz.** İki olası neden var: (a) **şişme** (yanlış-ev bilgisi, mezuniyet borcu, soft-delete kalıntısı, sıkıştırma) → temizle/mezun et; (b) **gerçek içerik büyümesi** → modüler böl. Önce teşhis sonra müdahale — şişmeyse bölme, temizle.
- **Bölünmeyen dokümanlar.** Snapshot/kanvas/index dokümanlar (DURUM, SESSION-NOTES, INDEX, MEMORY index'i, OVERVIEW, VERSIONS, NOTES) bölünemez; uzunlarsa bu **her zaman** şişmedir (a) ve çözüm temizliktir (MEMORY index'i için: bayatlamış öğrenimleri buda, gerekirse tek tek memory dosyalarını böl). İçerik dokümanları (modüller, PRD feature'ları, esnek içerik, QUALITY, docs) gerçekten büyüdüğünde bölünür (b).
- **Faz dokümanı hibrittir.** `PHASE-N.md` aynı dosyada üç rol taşır: **snapshot** (Task Listesi tablosu, UAT sonuç tablosu — özet kalır), **içerik** (Araştırma detayı) ve **tarihsel** (Retrospektif, Kalite Kontrol). Büyüdüğünde role göre ele alınır: snapshot tabloları yerinde kalır; içerik/tarihsel bölümler bölünür (b); **yanlış-ev yığılması** (icra detayı/çalışma notu Task Listesi'ne sızmış) bölme değil **temizliktir** (a) — doğru ev `tasks/TASK-N.md`.
- **Bölme yöntemi — taşı, sonra küçült.** Ana dokümanın adına **tire + anlamlı ek** getirerek alt-doküman aç (`MODULE-AUTH.md` → `MODULE-AUTH-FLOWS.md`, `PHASE-23.md` → `PHASE-23-RETROSPEKTIF.md`); alt-doküman da büyürse aynı mantıkla tekrar bölünür — isimler kendi içeriğini anlatır (ad eki parent'ın casing'ini izler — yapısal dokümanlar BÜYÜK; `memory/<slug>.md` gibi alt-sistemler kebab-case). Çıkarılan içerik alt-dokümana **taşınır ve parent'tan silinir** (mezuniyet — Çıkarma Disiplini). Parent **boşaltılmaz** ama **kopya da tutmaz**: yalnızca *kendi kendine yeten* 1-2 cümle özet + "detay için → X" pointer'ı kalır (boş "bkz. X" değil — kritik bilgi pointer'ın yanında görünür kalmalı). İçerik iki yerde kalırsa boyut düşmez ve drift doğar — bölmenin amacı tam da budur.
- **Keşfedilebilirlik + iki yönlü ağaç.** Alt-dokümanın başına `← <parent> · <tip>` geri-linki koy (`tip` = çocuğun rolü: retrospektif / araştırma-detayı / uat / küme-notu…). İçerik dokümanlarını (modül/docs) **INDEX.md / MODULE-MAP.md**'ye kaydet. Faz çocukları (`PHASE-N-*.md`) INDEX'te enumere edilmez (INDEX kuralı) — keşif kapıları **parent `PHASE-N.md` içindeki pointer listesidir**; parent o fazın mini-index'i olur (MEMORY index↔atom deseni gibi). Çok seviyeli bölmede her çocuk **doğrudan-ebeveyninin** pointer listesine kaydedilir ve `← <doğrudan-parent>` geri-linki alır; zincir kök dokümana kadar gezilebilir kalır.
- **Tarihsel doküman yaşarken bölünür.** Tamamlanmış faz dokümanı (`PHASE-N.md`, PHASES.md'de ✅) dokunulmazdır — bölme gerekiyorsa faz **hâlâ aktifken** yapılır; tamamlandıktan sonra bölmek "tarihsel dokümana dokunma" kuralıyla çelişir. Bu yüzden `research-phase` (Araştırma Bulguları sonrası), `verify-phase` (UAT sonrası) ve `review-phase` (✅ dondurmadan önce) faz hâlâ aktifken boyutu kontrol eder.
- **Önleyici tetik kapsamı (pilot).** Önleyici boyut kontrolü şu an yalnız faz döngüsündedir (research/verify/review). İçerik dokümanları (modül/PRD/QUALITY/docs) şimdilik yalnız **reaktif** audit ile kapsanır; dokümanı **baştan parçalı oluşturma** (create-as-pieces) bilinçle kapsam dışıdır — bölme yaşarken/reaktif yapılır.

### Bilginin Doğru Evi

Her doküman bir tür bilginin **evidir**; bilgi yanlış eve yazılırsa hem orayı şişirir hem doğru yerde bulunmaz.

- **Task icrası sırasında öğrenilen teknik nüanslar** (mawk vs gawk, framework bug'ı, vb.) → faz retrosu (`_dev/phases/PHASE-N.md`). `MEMORY.md` değil — MEMORY kalıcı/operasyonel veri içindir, task icra detayları değil.
- **Süreç/iş-akışı disiplini** (retrospektiften çıkan "şunu yaparken şu kontrolü her zaman yap" kuralı) → proje-özgü ise memory'nin "Süreç Disiplinleri" kategorisi; DevFlow yönteminin geneline dair ise faz retrosunun "DevFlow'a Öneri" bölümü (+ kullanıcıya bildirilir, DevFlow'a taşınır). `TASKS-README.md` değil — o dokunulmaz çekirdek protokoldür.
- **Oturum logları / "şu oturumda şu yapıldı"** → git log + faz dokümanları. `DURUM.md` veya `MEMORY.md` değil.
- **Aktif faz/task durumu, task durumu tablosu, son task özetleri** → `DURUM.md`. Faz durum özeti `PHASES.md`'de, faz detayı `PHASE-N.md`'dedir; DURUM'a "Son Tamamlanan Faz" gibi ek özet bölümü EKLENMEZ. `MEMORY.md` veya `INDEX.md` değil.
- **Mimari ve tasarım kararları** → `docs/DECISIONS.md` (append-only). `MEMORY.md` değil.
- **Faz detayları** → `phases/PHASE-N.md`. Faz `PHASE-N.md`'ye taşındığında `PHASES.md`'deki detay silinir, sadece durum + link kalır.
- **Proje yön-veren ilkeleri / öncelikleri** (kalıcılık, sır politikası, test felsefesi, proje ufku, en yüksek öncelikli eksenler) → `ILKELER.md`. Somut teknik kural değil (o "Projeye Özgü Kurallar"a), değerlendirme ekseni değil (o `QUALITY.md`'ye) — ILKELER yalnızca yön/öncelik tutar.

---

## Oturum Disiplini

### Planlama Oturumu:
- Faz kapsamı analiz edilir, task dokümanları oluşturulur
- **Task çalıştırılmaz** — planlama biter, oturum kapanır
- Planlama biter bitmez ilk task'i çalıştırmaya BAŞLAMA

### Task Oturumu:
- **Tek bir task'e** odaklanılır, bitirilir, oturum kapatılır
- İkinci task'e GEÇİLMEZ
- Her task sonunda sırasıyla: test → doküman güncelleme → commit & push

### Faz Planlaması:
- Bir seferde **sadece 1 faz** planlanır
- Sonraki faz ancak mevcut faz review'ı tamamlandıktan sonra planlanır

---

## Çalışma Prensipleri

1. **Otonom çalış.** Task'ı al, tamamla, test et, commit at.
2. **Şüphede sor.** Belirsizlik, risk veya karar gerektiren durumlarda kullanıcıya danış. Yanlış bir şey yapmaktansa sormaktan çekinme.
3. **Halüsinasyon yapma.** Emin olmadığın şeyleri yazma/söyleme. Eksik bilgi, yanlış bilgiden iyidir.
4. **Acele etme.** Kararların sonuçlarını düşün. Sırf öneri vermek için öneri verme.
5. **Varsayımları sorgula.** Kullanıcının her şeyi doğru yaptığını varsayma, kontrol et.
6. **Bilgi havuzunu güncel tut.** Elde ettiğin bilgileri düzenli kaydet. Önemli kararları `_dev/docs/DECISIONS.md`'ye yaz.
7. **Test atlanmaz.** Her task'ın tamamlanma kriteri teste bağlıdır.
8. **Riskli komutlar çalıştırma.** Emin olmadığın komutları çalıştırma, kullanıcıya danış.
9. **`_dev/` izolasyonunu koru.** DevFlow dokümanlarını `_dev/` dışına koyma, projenin dokümanlarını `_dev/` içine koyma.
10. **Hiçbir dosya yarım veya atlanarak okunmaz.** Bir Read çağrısı dosyayı tam getirmezse — çıktıda truncate / **PARTIAL** / satır-limiti uyarısı görürsen ya da istediğin aralık eksik döndüyse — **kör deneme-yanılma yapma** (giderek daralan aralıkları rastgele deneme) ve **yarım okuyup sonraki işe geçme**. Kural `_dev/` ile sınırlı değil; kod ve dış dosyalar dahil her Read için geçerli. Sırayla:
    0. **PARTIAL'ı görünür işaretle (zorlayıcı kapı):** Tek satır yaz — `PARTIAL: <dosya> L<a>-<b> okundu · gerisi kalan — kurtarıyorum`. Bu notu yazmadan ve kalan satırların **tamamı** okunmadan başka işe geçemezsin. (Görünür kapı bilinçlidir: salt "tam oku" buyruğunun bir tavanı var — atlama refleksi ancak yazılması zorunlu bir çıktıyla kırılır.)
    1. **Mekanik haritala:** `bash .claude/commands/devflow/scripts/doc-scan.sh <dosya>` çalıştır. Bu script Read aracını kullanmaz (`wc`/`awk` ile çalışır), o yüzden Read'in açamadığı dosyayı bile tarar — satır sayısını, en yoğun bölgeyi (en uzun satır @ satır no) ve toplam boyutu verir.
    2. **Konumla:** `grep -n` ile ihtiyacın olan başlığı/bölgeyi bul.
    3. **Kalanı tamamla:** doc-scan'in gösterdiği yoğunluğa göre offset+limit ile dar, hedefli aralıklar oku (yoğun bölgede daha küçük pencere); **doc-scan'in verdiği son satıra kadar kapsanmamış satır kalmayana dek tekrarla** — başarı koşulu budur, "bir parça daha okudum" değil.
    4. **`_dev/` dokümanıysa işaretle:** Tek-okumaya sığmayan bir `_dev/` dokümanı aynı zamanda bir Boyut ve Bölünme ihlalidir — kullanıcıya bölme/temizleme öner (Doküman Disiplini → Boyut ve Bölünme). (Kod/dış dosyalarda bu adım yok — yalnız kurtar.)
    5. **Yine olmazsa dur:** Hedefli parçalı okuma da başarısızsa **dur, durumu kullanıcıya bildir, yardım iste** — eksik bilgiyle devam etme, atlama.
11. **Boşluk varsa önce araştır, sonra gerekirse sor.** Bilmediğin bir konu/dosya/kullanım/bağlam karşına çıktığında varsayımla doldurma — ilgili dokümanı oku, grep/find ile kodda ara, gerektiğinde web araştırması yap. Araştırma sonrasında hala net değilse kullanıcıya sor.

---

## Task Boyutu Felsefesi

**Task dokümanı detaylı, iş paketi küçük.**

- Az context = yüksek kalite
- Her task tek oturumda, dar odakla bitirilecek boyutta olmalı
- 1-3 dosya değişikliği ile tamamlanabilir
- "Önce şunu sonra bunu" diye ikiye bölünebiliyorsa → bölünmeli
- Task sayısının fazla olması sorun değil — küçük ve odaklı olması önemli
- Yan yana yapılması gereken işler aynı task'te olabilir

---

## Dokümantasyon İlkeleri

- **Doküman oluşturmaktan çekinme.** Gerekli gördüğün her bilgi kendi dokümanını hak eder.
- **Tekrarlayan bilgi yazma.** Bir bilgi tek yerde olmalı, diğer yerlerden referans ver.
- **İleriye dönük düşün.** Sonra lazım olacak bilgiler için şimdiden doküman aç.
- **INDEX.md'yi güncelle.** Yeni bir **içerik dokümanı** (modül, docs, PRD içerik, projeye özgü sabit) oluşturduğunda INDEX.md'ye ekle. Task ve faz dokümanları INDEX'te tek tek enumere edilmez — güncel listeleri DURUM.md ve PHASES.md'de tutulur, INDEX yalnızca klasör konumunu gösterir.
- **INDEX.md'ye sadece mevcut dokümanları yaz.** Henüz oluşturulmamış dokümanları referans etme.
- **Her şey `_dev/` içinde.** Yeni dokümanlar `_dev/` klasöründe oluşturulur.
- **Projeye özgü bilgileri `_dev/` içinde tut.**
  - Geliştirme sırasında öğrenilen her bilgi proje dokümanlarına yazılmalı — Claude Code'un local memory'si (`~/.claude/`) proje bilgisi için kullanılmaz.
  - Bilgi uygun dokümana gider: kararlar → `docs/DECISIONS.md`, kalite → `QUALITY.md`, vb. Başka dokümana uymayan öğrenimler → `_dev/memory/<slug>.md` (MEMORY.md index'ine pointer eklenir).
  - Böylece repo taşındığında hiçbir bilgi geride kalmaz.

---

## Task Tamamlanma Sırası

Her task bittiğinde bu sıra izlenir (ATLANMAZ):
1. **Test** — Testleri çalıştır (yoksa yaz ve çalıştır)
2. **Task Dokümanı** — Oturum kaydı ekle, durumu güncelle
3. **DURUM.md ve Faz Dokümanı** — Aktif task pointer güncelle, task özeti ekle. Faz dokümanında task durumu güncelle.
4. **MEMORY** (gerekirse) — Beklenmeyen proje-geneli tuzak/öğrenim varsa `_dev/memory/<slug>.md` ekle/güncelle + MEMORY.md index'ini güncelle
5. **Archive** — Task bittiyse `_dev/tasks/archive/` klasörüne taşı
6. **Commit & Push** — Tüm değişiklikleri (kod + doküman) tek commit'te gönder
7. **Oturum Kapanır** — İkinci task'e geçilmez

---

## Commit Stratejisi

**Bir oturum = bir commit** (varsayılan tutum). Her DevFlow oturumunu tek commit ile sonuçlandırmayı hedefle. Kod ve doküman değişikliklerini **aynı commit'te topla** — ayrı "docs: update" commit'i açma. Type prefix baskın değişikliğe göre seçilir (kod varsa `feat`/`fix`/`refactor`, sadece doküman değiştiyse `docs`).

Sıkı bir kural değil; gerçekten gerektiren durumlarda ek commit meşrudur. Ama "bir parça iş bittikçe hemen commit'leyeyim" refleksiyle fragment yaratma — varsayılan tutum tek commit.

---

## Commit Convention

```
feat(TASK-X.YY): kısa açıklama          # Yeni özellik
fix(TASK-X.YY): kısa açıklama           # Bug fix
refactor(TASK-X.YY): kısa açıklama      # Refactor
docs(TASK-X.YY): kısa açıklama          # Doküman değişikliği
test(TASK-X.YY): kısa açıklama          # Test ekleme/düzeltme
chore(TASK-X.YY): kısa açıklama         # Build, config vb.
```

**Quick mode** (`/devflow:quick` ile yapılan task dışı işler) scope'suz yazılır:
```
fix: kısa açıklama                      # Bug fix (quick mode)
feat: kısa açıklama                     # Küçük feature (quick mode)
```

**Faz oturumu** (faz döngüsü komutlarının ürettiği, task dışı faz-aşaması commit'leri) scope = `phase-N` yazılır:
```
docs(phase-N): <aşama> — kısa açıklama  # örn. docs(phase-3): research — technical research completed
```

Kurallar:
- Type prefix zorunlu
- Faz task'larında scope olarak task numarası (`TASK-X.YY`) yazılır
- Faz oturumu commit'lerinde scope `phase-N`, açıklama `<aşama> — ...` formundadır (`<aşama>` = discuss/research/plan/verify-plan/UAT/review)
- Quick mode'da scope yazılmaz
- Açıklama İngilizce, küçük harfle başlar, nokta ile bitmez

---

## DevFlow Komutları

Kullanıcı `/devflow:` ile başlayan komutlar kullanabilir. Komut dosyaları `.claude/commands/devflow/` klasöründedir.

**PRD:** `prd`, `prd-refine`, `prd-save`, `prd-note`, `prd-review`
**Proje Başlatma:** `kickoff`, `kickoff-docs`, `kickoff-verify`, `map-codebase`
**Faz Döngüsü:** `discuss-phase`, `research-phase`, `plan-phase`, `verify-plan`, `run-task`, `verify-phase`, `review-phase`
**Yardımcı:** `next`, `quick`, `pause`, `resume`, `progress`, `double-check`, `audit-docs`, `step-by-step`, `guide-me`, `help`

---

## Dokunulmazlar

Bu dosyaları değiştirme (kullanıcı izni olmadan):
- [Projeye göre belirlenecek — .env, config dosyaları, migration'lar vb.]

---

## Projeye Özgü Kurallar

[PROJEYE_ÖZGÜ_KURALLAR — örnekler:]
[- Tailwind v4 kullanılıyor, v3 syntax'ı KULLANMA]
[- TypeScript strict mode]
[- Tailwind işi → önce _dev/docs/TAILWIND-REFERANS.md oku]

---

*Bu doküman statiktir. Dinamik bilgiler (aktif task, ilerleme) için `_dev/DURUM.md`'ye bak.*
