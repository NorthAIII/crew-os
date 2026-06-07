# M2: Hermes — Outreach

**Sorumluluk:** Lead'lere segment/step bazlı otomatik e-posta sekansı gönderir, gelen yanıtları LLM ile sınıflar, opt-out'ları bastırır, toplantı taleplerine Cal.com linkiyle yanıt verir.
**Bağımlılık:** M1 (db/llm/tenant), ileride M4 (alıcı kaynağı + sonuç yazımı Twenty)
**Sınır:** E-posta gönderim/alım + sınıflama + sekans durumu. Lead'in CRM kimliği M4'te (Twenty).

---

## Feature'lar

### F2.1: Sequence-sender (Gmail) → ✅ (taşındı) · ⚠ Twenty dikişi bekliyor

**Açıklama:** Hazır lead'leri çeker (nextFollowupAt ≤ now, günlük cap + enabled gate), (segment, step) şablonunu doldurur, Gmail ile gönderir, `hermes_emails`'e loglar, sekans durumunu ilerletir.

**Kabul Kriterleri:**
- Günlük cap aşılmaz; enabled=false ise gönderim durur
- Şablon {{var}} doldurma + segment fallback çalışır
- MockTransport ile `hermes:dryrun` yeşil
- `policy.test.ts` + `templates.test.ts` + `gmail.test.ts` yeşil

**Bağımlılık:** F1.3 (db), F1.4 (yok — sender LLM kullanmaz)

**Edge Case'ler:** `beauty-bc` gibi telefon-kanalı segmenti (e-posta yok) — sender atlamalı, ayrı kanal tasarımı.

### F2.2: Reply-handler + sınıflama → ✅ (taşındı) · ⚠ sonuç Twenty'ye yazılacak

**Açıklama:** Gelen yanıtı Haiku + keyword override (TR/EN/DE) ile sınıflar (meeting/positive/negative/OOO), opt-out'u suppression'a yazar, toplantı talebine Cal.com linki yollar, Slack bildirir.

**Kabul Kriterleri:**
- Keyword opt-out override (LLM'den önce) çalışır
- meeting_request → Cal.com linki
- negative → `email_suppression`
- `classify.test.ts` yeşil

**Bağımlılık:** F2.1, F1.4

**Edge Case'ler:** Belirsiz/çok-dilli yanıt → LLM fallback; suppression'daki adrese gönderim yasak.

### F2.3: Templates/policy/suppression → ✅ (taşındı)

**Açıklama:** Saf modüller — şablon doldurma, lead ilerleme state machine, opt-out listesi.

**Kabul Kriterleri:** Pure fonksiyonlar test-izole; sıfır dış bağımlılık.

---

## Teknik Notlar

- **Twenty dikişi (M4):** Şu an alıcı `leads` tablosundan geliyor. Twenty entegrasyonunda alıcı Twenty Person'dan çekilecek; sekans durumu Crew'de ince `outreach_state` (twenty_person_id) tablosunda tutulacak; yanıt sonucu Twenty'ye aktivite/durum olarak yazılacak.
- Kimlik (CC adresi, Cal.com linki, Slack kanalı) `tenant_config`'ten gelir — hardcode değil.

---

**Son Güncelleme:** 2026-06-07
