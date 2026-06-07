# DevFlow — Oturumu Durdur (Pause)

Bu komut bir oturumu düzgünce durdurmak ve sonraki oturumda kaldığı yerden devam edebilmek için handoff bilgisi yazmak amacıyla kullanılır.

**Kullanım:** `/devflow:pause`

---

## Okunacak Dosyalar

pause oturum-sonu komutudur (double-check / prd-save ile aynı kategori): ana komut Oturum Başlangıç Protokolü'nü zaten uygulamıştır, OVERVIEW/INDEX/DURUM/MEMORY bağlamdadır — protokolü tekrar tetikleme. Handoff, aktif durum (faz/adım/task) DURUM.md'nin bağlamdaki kopyasından okunarak canlı çalışma belleğinden yazılır. **Sabit ek dosya listesi yok.**

---

## Yapılacaklar

### 1. Aktif Çalışmayı Tespit Et

DURUM.md'den aktif durumu oku:
- Hangi faz aktif?
- Hangi adımdayız? (discuss, research, plan, verify-plan, task, verify, review)
- Aktif task var mı?

### 2. Handoff Bilgisi Yaz

**Task oturumundaysa** → Task dokümanının **Oturum Kayıtları** bölümüne `.claude/commands/devflow/templates/TASK.md` yapısına uygun, **Durum: ⏸️ Duraklatıldı** olan zengin bir kayıt yaz — yapı template'te tanımlıdır, burada tekrarlanmaz (tek-ev). Duraklatmada **"Son Yaklaşım"** ve **"Sonraki Adım Detayı"** alanları en kritik olanlardır, bunları dolu bırak.

**Planlama/review gibi bir oturumdaysa** → DURUM.md'nin **Duraklatma Notu** bölümünü o slotun kanonik formatına göre doldur (bkz. DURUM template → Duraklatma Notu):
```
> ⏸️ **Duraklatıldı:** [tarih]
> **Adım:** [planlama / review / vb.]
> **Detay:** [Nerede kalındı, ne yapılacak]
> **Handoff:** burada (planlama/review oturumu — ayrı task dokümanı yok)
```

### 3. Varsa Commit & Push

Eğer kaydetilmemiş değişiklik varsa:
```
chore: WIP — pause at [kısa açıklama]
```

### 4. DURUM.md Güncelle

Aktif duruma duraklatma bilgisi ekle.

### 5. Kullanıcıya Bilgi Ver

```
⏸️ Oturum duraklatıldı. Handoff bilgisi yazıldı.
📋 Devam etmek için: /devflow:resume
```

---

## Önemli Kurallar

- Handoff bilgisi detaylı olmalı — sonraki oturum bu bilgiyle başlayacak
- "Son yaklaşım" ve "sonraki adım detayı" en kritik alanlar
- Varsa ara commit at — yarım değişiklik bırakma
