# M3: Brifing Beyni (Crew)

**Sorumluluk:** Günlük AI sabah brifingi üretir ve insan onaylı aksiyon dağıtımını yönetir: Scout→Strategist⇄Critic→Conductor pipeline'ı + Graduated Autonomy (onay oranına göre oto-onay/red) + Reflexion (haftalık öğrenme).
**Bağımlılık:** M1 (db/llm/tenant), M2 (outreach metrik + dispatch hedefi), M4 (CRM metrik), M6 (içerik dispatch)
**Sınır:** Karar üretimi + onay akışı + öğrenme. Aksiyonun kendisini M2/M6 yürütür; CRM verisini M4 sağlar.

---

## Feature'lar

### F3.1: Scout/Strategist/Critic/Conductor pipeline → ✅ (taşındı)

**Açıklama:** Scout (Haiku: metrik+KB+ders → fırsat/risk) → Strategist (Sonnet: aksiyon planı) ⇄ Critic (Haiku: en fazla 3 tur red/iyileştir) → Conductor (Sonnet: brifing + pending aksiyon bloğu).

**Kabul Kriterleri:** STUB ajanlarla `crew:dryrun` yeşil; ajanlar enjekte-edilebilir (test için); crew_runs + crew_decisions DB'ye yazılır.

**Edge Case'ler:** LLM JSON bozarsa fallback; Critic 3 turda onaylamazsa Conductor mevcut planla devam eder.

### F3.2: Graduated Autonomy → ✅ (taşındı)

**Açıklama:** Kategori bazlı 30-günlük onay oranına göre aksiyonları oto-onayla (≥%80 & n≥3), oto-reddet (≤%20 & n≥3) veya insana sor.

**Kabul Kriterleri:** `autonomy.test.ts` (4 test) yeşil; eşik/min-örnek kontrolleri doğru.

### F3.3: Reflexion (öğrenme döngüsü) → ✅ (taşındı)

**Açıklama:** Haftalık (Pazar 23:00) onay/red pattern'lerini Sonnet ile analiz eder, dersleri `crew_lessons`'a yazar; Scout sonraki koşuda okur. Sistemin en özgün parçası.

**Kabul Kriterleri:** 7-günlük karar geçmişinden ders üretir; Scout dersleri KB sorgusuna katar.

### F3.4: KB (Postgres FTS) → ✅ (taşındı)

**Açıklama:** Vektör DB yok — `kb_chunks` üzerinde GIN tsvector, OR tsquery + ts_rank. Markdown chunking saf fonksiyon.

**Kabul Kriterleri:** `kb-text.test.ts` (3 test) yeşil; `db:seed:kb` ile markdown → chunk.

### F3.5: Dispatch executor'ları → 🟡 (kısmi)

**Açıklama:** Onaylı aksiyonu yönlendirir: OUTREACH→Hermes (var); ICERIK→Frida/Postiz, CRM→Twenty, ARASTIRMA→lead-gen (stub, "Faz 4").

**Kabul Kriterleri:** OUTREACH dispatch çalışır; diğer executor'lar ilgili modüller gelince bağlanır.

---

## Teknik Notlar

- Model id'leri config'te (Haiku/Sonnet env-override).
- Metrikler `metrics.ts`'te; Twenty entegrasyonunda pipeline/deal metriği Twenty'den çekilecek.

---

**Son Güncelleme:** 2026-06-07
