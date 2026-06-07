# KICKOFF-NOTES — Crew OS

> kickoff oturumunun kararları. kickoff-docs bunu okuyup `_dev/` dokümanlarını (MODULE-MAP, PHASES, modules/, gerekirse projeye-özgü) kesinleştirir. Sonra kickoff-verify CLAUDE.md'yi üretir.

## Mod

**İlk kickoff (PRD'li).** CLAUDE.md henüz yok → ilk kickoff. `_dev/MODULE-MAP.md` ve `PHASES.md` map-codebase tarafından taslaklanmıştı; PRD ile hizalanıp kesinleştirildi. PRD korunur (silinmez).

## Modül Yapısı (onaylandı)

PRD feature dokümanları → teknik modüller (mevcut MODULE-MAP ile uyumlu, değişiklik yok):

| Modül | Kapsam | Durum |
|-------|--------|-------|
| M1 Çekirdek Altyapı | auth, tenant, db, llm, worker | ✅ taşındı |
| M2 Hermes | outreach sekansı + yanıt işleme | ✅ taşındı (Twenty dikişi bekliyor) |
| M3 Brifing Beyni | Scout/Strategist/Critic/Conductor + autonomy + reflexion | ✅ taşındı (dispatch kısmi) |
| M4 Twenty Entegrasyonu | CRM kaynağı; lead import + Cal.com + outreach_state | ⬜ yeni |
| M5 Ops Dashboard | onay kuyruğu + Hermes aktivite + brifing (shadcn/ui + Tremor) | ⬜ yeni |
| M6 Frida + Postiz | içerik üretimi + yayın | ⬜ yeni (v0.5) |

Bağımlılık: M1 ← herkes; M2→M1,M4; M3→M1,M2,M4,M6; M4→M1; M5→M1,M2,M3,M6; M6→M1,M3.

## Faz Planı (onaylandı — v0.1, numarasız "Sıradaki Fazlar")

> Versiyonlar = kullanılabilirlik birimi; fazlar = geliştirme birimi. Numara faza girince (discuss-phase) damgalanır. İlk faz: **Şema dikişleri + rebrand**.

1. **Şema dikişleri + rebrand temizliği** — `outreach_state` pointer şeması; leads/meetings'i Twenty'ye devre hazırla; "Bunker"→"Crew" izleri (page başlığı, `_bunkerSql`→`_crewSql`). *Milestone:* yeni şema migrate + rebrand temiz + 44 test yeşil.
2. **Twenty entegrasyonu (CRM kaynağı)** — Twenty self-host/cloud ayağa; `src/lib/twenty/` istemci; Person custom field'lar; lead import→Twenty; Cal.com→Twenty. *Milestone:* CSV import → kayıt Twenty UI'da görünür.
3. **Hermes↔Twenty canlı dikiş** — sequence-sender alıcıyı Twenty'den çeker; reply-handler sonucu Twenty'ye (aktivite/durum) + suppression yazar. *Milestone:* `hermes:dryrun` Twenty'den okur; yanıt Twenty kaydını + suppression'ı günceller.
4. **Ops dashboard** — onay kuyruğu (tek-tık approve/reject) + Hermes aktivite + brifing görüntüleme (shadcn/ui + Tremor). *Milestone:* onay → dispatch çalışır, auth arkasında.
5. **Brifing canlı + dispatch executor'ları** — günlük brifing cron + gerçek LLM; Graduated Autonomy + Reflexion canlı; ICERIK/CRM dispatch. *Milestone:* brifing → onay → Hermes uçtan uca.
6. **Kiwi içi dogfood** — gerçek Gmail/Anthropic/Cal.com; mevcut Kiwi lead'leri Twenty'ye; canlı outreach + 1 hafta gözlem. *Milestone:* canlı outreach gönderildi + yanıt sınıflandı + günlük brifing.

Sonraki versiyonlar (faz numarası almaz, versiyon düzeyinde): **v0.5** Frida+Postiz · **v1.0** çok-tenant satış sertleştirmesi.

## Projeye Özgü Doküman İhtiyaçları

- **Dashboard STYLE-GUIDE** (shadcn/ui + Tremor konvansiyonları) — M5/Ops dashboard fazı başlarken oluştur.
- **Twenty entegrasyon notları** (custom field şeması, API eşleme) — Twenty fazında `docs/`'a.
- TECH-STACK ayrı dosya gerekmez (OVERVIEW + DECISIONS yeterli).

## Açık Sorular (PRD SESSION-NOTES'tan, ilgili fazda çözülecek)

- Twenty lokal barındırma: host Docker vs Twenty Cloud → Twenty entegrasyon fazı.
- Kiwi lead göçü zamanı/yöntemi → dogfood fazı.
- Lead-gen (SerpAPI) ve raporlama kapsamı v0.1'de mi → discuss-phase'de değerlendir.
- Bildirim kanalı (Slack/dashboard/e-posta) → dashboard fazı.

---

**Sıradaki adım:** `/devflow:kickoff-docs` → dokümanları kesinleştir (MODULE-MAP/PHASES güncel; çoğu hazır) → `/devflow:kickoff-verify` → CLAUDE.md üret.
