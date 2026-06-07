# M6: Frida + Postiz (İçerik) — [YENİ · sonraki versiyon]

**Sorumluluk:** Markaya uygun sosyal medya içeriği üretir (Frida, LLM) ve Postiz üzerinden zamanlayıp yayınlar. İçerik üretimi bizim, yayın motoru Postiz.
**Bağımlılık:** M1 (db/llm/tenant), M3 (içerik dispatch), M5 (onay UI)
**Sınır:** İçerik üretimi + Postiz'e gönderim. Platformlara fiili post atma Postiz'in işi. v0.5 (sonraki versiyon).

---

## Feature'lar

### F6.1: Frida içerik üretici (LLM) → ⬜

**Açıklama:** Marka sesi (`tenant_config`'ten) + konu/brief → Sonnet ile platform-bazlı içerik üretir, `content_queue`'ya yazar (onay bekler).

**Kabul Kriterleri:** Üretilen içerik markaya uygun; content_queue'ya platform + metin + (varsa) görsel referansı yazılır; dispatch ICERIK → buraya gelir.

**Bağımlılık:** F1.4, M3 dispatch

**Edge Case'ler:** Platform karakter limiti; çok-platform varyantları.

### F6.2: Postiz yayın istemcisi → ⬜

**Açıklama:** `src/lib/postiz/` — onaylı içeriği Postiz REST API (`/public/v1/upload` + `/public/v1/posts`) ile zamanlar. Webhook yok → durum poll.

**Kabul Kriterleri:** Onaylı içerik → Postiz'de zamanlanır → test kanalına yayımlanır; medya upload → post bağlama; durum poll.

**Bağımlılık:** F6.1, Postiz instance (self-host Docker — Temporal bağımlı)

**Edge Case'ler:** Postiz rate limit (90/saat); yayın hatası → görünür + retry; AGPL → Postiz değiştirilmez, API-only.

---

## Teknik Notlar

- **Postiz operasyonel ağırlık:** NestJS + Postgres + Redis + Temporal cluster. Bu yüzden v0.5'e ertelendi (önce çekirdek + CRM + dashboard + dogfood).
- Frida tek başına da hizmet olarak satılabilir (strateji); modüler tutulacak.

---

**Son Güncelleme:** 2026-06-07
