# DECISIONS — Karar Günlüğü

**Amaç:** Önemli mimari ve tasarım kararlarının kaydı. "Neden X yerine Y tercih edildi?" sorusunun cevabı burada.
**Ne zaman güncellenir:** Önemli bir teknik, mimari veya tasarım kararı alındığında.

---

<!-- Her yeni karar aşağıdaki formatta en üste eklenir (en yeni en üstte) -->

### 2026-06-07 — Dashboard: kendi yazımımız (shadcn/ui + Tremor), low-code araç değil

**Bağlam:** CRM=Twenty, yayın=Postiz gibi dashboard için de hazır OSS kullanılsın mı?

**Seçenekler:**
1. Low-code self-host (Appsmith/ToolJet/Budibase) — hızlı ama +3 container, kritik onay UX'i dış araca emanet
2. shadcn/ui + Tremor ile Next.js içinde kendi ekranlarımız — sıfır ekstra servis, onay akışı bizde
3. Twenty UI'ını uzat — CRM'e bağımlı, ajan-özel ekranlar zorlanır

**Karar:** Seçenek 2.

**Gerekçe:** Zaten Next.js'iz; onay kuyruğu ürünün kalbi (metalaşmış değil), kendimiz sahiplenmeli. CRM tabloları zaten Twenty'de — dashboard ajan-özel ekranlardır.

**İlgili Task/Faz:** M5 / Ops dashboard fazı

---

### 2026-06-07 — Proje yönetimi: DevFlow

**Bağlam:** Sıfırdan kurulan Crew OS'un disiplinli ilerlemesi gerek; context rot riski.

**Karar:** DevFlow (github 36337/DevFlow, MIT) `.claude/commands/devflow/`'a kuruldu; brownfield giriş (map-codebase → prd → kickoff → faz döngüsü).

**Gerekçe:** Her adım ayrı oturum + faz→gate disiplini; eski "DevFlow erişilemez" engeli kalktı (VSCode git kimlik yardımcısı).

**İlgili Task/Faz:** Kurulum

---

### 2026-06-07 — Lokal-önce geliştirme; VPS ertelendi

**Bağlam:** Nerede kurulacak? Devcontainer'da Docker YOK (tasarım gereği host'ta çalışır).

**Karar:** Crew OS çekirdeği lokalde Docker'sız koşar (Node 24 + lokal Postgres 17, db `crew_os`). Twenty/Postiz host Docker veya Twenty Cloud (karar Twenty fazında). Beğenilirse Hetzner VPS'e taşınır (en son, opsiyonel).

**Gerekçe:** Çekirdek Docker gerektirmiyor; erken değer, düşük kurulum riski.

**İlgili Task/Faz:** Faz 0 (iskelet)

---

### 2026-06-07 — Twenty = CRM'in tek gerçek kaynağı; Crew DB sadece pointer + ajan durumu

**Bağlam:** Lead/contact/deal verisi nerede yaşasın?

**Seçenekler:**
1. Twenty kaynak; Crew DB sadece pointer + ajan durumu
2. Crew DB kaynak, Twenty sonra/opsiyonel
3. Hibrit çift-yönlü senkron

**Karar:** Seçenek 1.

**Gerekçe:** Twenty CRM UI'ı bedava + ajan-yazımına biçilmiş (REST/GraphQL/MCP). İkinci kopya tutmayınca çift-yönlü senkron kâbusu doğmaz; Crew yalnızca `twenty_person_id` + sekans/karar tutar.

**İlgili Task/Faz:** M4 / Twenty entegrasyonu fazı

---

### 2026-06-07 — Build-vs-buy: tesisat OSS'ten, zekâ bizden (Twenty + Postiz; Goose hayır)

**Bağlam:** Bunker OS sıfırdan "Crew OS" olarak yeniden kuruluyor; ne yazalım ne hazır alalım?

**Karar:** CRM=Twenty (AGPL), sosyal yayın=Postiz (AGPL) hazır alınır, **değiştirilmeden yalnızca API'den** kullanılır. Agentic zekâ (Hermes/Frida/brifing/onay-öğrenme) kendimizin. Goose şimdilik alınmaz (backend orkestratör değil).

**Gerekçe:** Metalaşmış tesisatı yeniden yazmak israf; farklılaşma agentic zekâda. AGPL iç kullanımda sorunsuz, API-only kullanım ileride SaaS satışını korur.

**İlgili Task/Faz:** Tüm proje (temel mimari)

---

### 2026-06-07 — v3 çekirdeği taşındı (sıfırdan yazılmadı); Anthropic-only + Postgres FTS korundu

**Bağlam:** "0'dan repo" — Bunker OS v3'ün kanıtlanmış kodu ne olacak?

**Karar:** Yeni repo, ama v3'ün çekirdeği (Hermes + brifing beyni + auth + tenant + şema + 44 test) **taşındı**. Anthropic-tek-sağlayıcı ve KB için Postgres full-text search (vektör DB yok) kararları korundu.

**Gerekçe:** ~2700 satır test edilmiş kodu çöpe atmak israf; "0'dan" = yeni repo & temiz dikiş, kanıtlanmış kodu koru.

**İlgili Task/Faz:** Faz 0 (iskelet)

---
