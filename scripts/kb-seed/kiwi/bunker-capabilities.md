# Bunker — Sistem Yetenekleri

Bu doküman Bunker'ın teknik yeteneklerini açıklar. General Assistant agent bu bilgiyi kullanarak müşteri sorularını yanıtlar.

---

## Altyapı

| Bileşen | Teknoloji | Amaç |
|---------|-----------|-------|
| Workflow engine | n8n (self-hosted) | Tüm agent akışları |
| Ana veritabanı | PostgreSQL 15 | Lead, meeting, log kayıtları |
| Vektör veritabanı | Qdrant | AI hafıza ve KB araması |
| Queue | Redis | n8n worker queue |
| Reverse proxy | Nginx | Rate limiting, SSL |
| Sunucu | Hostinger KVM2 VPS (178.104.140.36) | Üretim ortamı |
| LLM | Claude Sonnet 4.6 (Anthropic) | Tüm AI çağrıları |

---

## Desteklenen Entegrasyonlar

### Outreach & Email
- **Instantly.ai** — Kişiselleştirilmiş email kampanyaları, warm-up, sekans yönetimi
- Günlük 30-80 email gönderimi (warm-up tamamlandıktan sonra)
- Açılma/tıklama takibi

### Toplantı Rezervasyonu
- **Cal.com** — Discovery Call event type
- Webhook ile Bunker'a otomatik bildirim
- Takvim senkronizasyonu

### CRM (Opsiyonel)
- **GoHighLevel** — Contact oluşturma, pipeline stage yönetimi, SMS/WhatsApp
- **HubSpot** — Lead sync (API üzerinden)
- Postgres yeterli değilse eklenebilir

### Mesajlaşma
- **Slack** — Tüm bildirimlerin merkezi (lead geldikten, toplantı ayarlandı, hata vb.)
- **WhatsApp** — WATI veya Twilio üzerinden (isteğe bağlı)

### Sosyal Medya (İleride)
- LinkedIn API v2 — Post yayınlama
- Instagram Graph API — Caption + görselle paylaşım

### Veritabanı Araçları
- Adminer (localhost:8181) — Web tabanlı DB yönetimi
- psql (docker exec üzerinden) — Direkt SQL

---

## Webhook Endpoint'leri

| Endpoint | Amaç |
|----------|-------|
| `POST /webhook/lead-intake` | Yeni lead girişi (web form, GHL vb.) |
| `POST /webhook/outreach` | Outreach agent'ı tetikle |
| `POST /webhook/calcom-meeting` | Cal.com rezervasyon bildirimi |
| `POST /agent/general` | General Assistant sorgusu |
| `POST /agent/social` | Social media içerik talebi |
| `POST /agent/tech` | Tech Agent görevi |
| `POST /agent` | Genel router (intent sınıflandırması) |
| `GET /health` | Sistem sağlık kontrolü |

---

## Veritabanı Tabloları

| Tablo | İçerik |
|-------|--------|
| `leads` | Tüm potansiyel müşteri kayıtları |
| `meetings` | Cal.com'dan gelen toplantılar |
| `agent_executions` | Her agent çalışmasının log'u |
| `outreach_campaigns` | Instantly.ai kampanya metrikleri |
| `system_logs` | Sistem hata ve bilgi log'ları |
| `content_queue` | Social Media Creator içerik kuyruğu |
| `tech_tasks` | Tech Agent görev geçmişi |

---

## Kısıtlamalar ve Bilinmesi Gerekenler

- **n8n `$vars` KULLANILMAZ** — Paid özellik. `$env` kullanılır.
- **N8N_BLOCK_ENV_ACCESS_IN_NODE=false** olmalı — env değişkenlerine erişim için
- **Workflow-to-workflow iletişim:** HTTP Request + Webhook ÇALIŞMAZ, Execute Workflow node kullanılır
- **SQL içinde expression:** `{{ $json.field }}` formatında çalışır
- **VPS'te docker compose** — `docker-compose` değil `docker compose` (v2) kullanılır
- **Şu an eksik:** OpenAI_API_KEY / Anthropic API key VPS'e eklenmedi (Hafta 2'de eklenecek)
- **Rate limit:** Webhook'larda 30 req/min (burst: 10), Qdrant 60 req/min

---

## Sistem Sağlık Kontrolü

```bash
# VPS'te container durumu
ssh root@178.104.140.36
docker compose ps

# Sağlık kontrol URL
curl http://178.104.140.36/health

# n8n UI
http://178.104.140.36  (HTTP)
https://n8n.kiwiailab.com  (HTTPS - Hafta 1'de aktif olacak)

# DB kontrolü
docker exec -it bunker-postgres psql -U bunker_user -d bunker
```

---

## Bilinen Sorunlar (6 Mart 2026)

1. **Cal.com webhook** → henüz bağlı değil (Hafta 1 görevi)
2. **SSL/HTTPS** → henüz kurulu değil (Hafta 1 görevi)
3. **Anthropic API key** → VPS'e eklenmedi (Hafta 2 görevi)
4. **Qdrant KB** → boş, doldurulmadı (Hafta 2 görevi)
5. **Lead scoring** → Claude API bağlı değil, henüz çalışmıyor
