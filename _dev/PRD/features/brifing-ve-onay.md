# Brifing Beyni + Onay Kuyruğu (Graduated Autonomy + Reflexion)

## Özet

Crew OS'un "AI COO" beyni: her gün metrikleri (Twenty pipeline + Crew durumu) okur, bir durum analizi + aksiyon planı üretir (Scout→Strategist⇄Critic→Conductor), ve sonucu insan için bir brifing + onay kuyruğu olarak sunar. İnsan dashboard'dan tek-tıkla onaylar/reddeder; onaylanan aksiyonlar ilgili ajana dağıtılır. Sistem onay/red pattern'lerinden öğrenir (Graduated Autonomy) ve haftalık ders çıkarır (Reflexion), zamanla daha otonom olur.

## Kullanıcı Senaryoları

- Her sabah sistem bir brifing üretir: "Dün şunlar oldu, bugün şunları öneriyorum" + onay bekleyen aksiyon listesi.
- Kıvanç dashboard'da kuyruğu görür; her aksiyonu tek-tıkla onaylar veya reddeder.
- Onaylanan OUTREACH aksiyonu Hermes'e, ICERIK aksiyonu Frida'ya (v0.5) dağıtılır.
- Zamanla sık-onaylanan kategoriler otomatik onaylanır; Kıvanç sadece istisnaları görür.

## Davranış Kuralları

- Pipeline sırası: **Scout** (metrik+KB+ders) → **Strategist** (plan) ⇄ **Critic** (en fazla 3 tur red/iyileştir) → **Conductor** (brifing + pending aksiyon bloğu).
- Her aksiyon başlangıçta **insan onayından** geçer (onay kapısı — pazarlık konusu değil).
- **Graduated Autonomy:** kategori 30-günlük onay oranı **≥%80 & n≥3** → oto-onay; **≤%20 & n≥3** → oto-red; arası → insana sor.
- Her onay/red **kaydedilir** (`crew_decisions`) ve öğrenmeyi besler.
- **Reflexion (haftalık):** onay/red pattern'leri analiz edilir, dersler (`crew_lessons`) yazılır; Scout sonraki koşuda okur.
- Brifing metriği **Twenty pipeline + Crew durumundan** beslenir.
- Conductor onay bloğunu **her zaman** üretir (LLM unutsa bile garanti edilir).

## Edge Case'ler ve Sınır Durumları

- Critic 3 turda planı onaylamazsa: Conductor mevcut en iyi planla devam eder, durum brifingde belirtilir.
- Oto-onaylanan aksiyonlar da dashboard'da görünür (şeffaflık — sessiz otomasyon değil).

## Hata Durumları

- LLM çağrısı bozulursa: completeJson fallback döner, brifing yine üretilir (eksik kısım işaretlenir), pipeline patlamaz.

## İlişkili Feature'lar

- `ops-dashboard.md` (onay kuyruğu UI), `hermes-outreach.md` (OUTREACH dispatch), `frida-icerik-postiz.md` (ICERIK dispatch, v0.5), `twenty-crm-kaynak.md` (metrik).
