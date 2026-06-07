# Crew OS — Vizyon

## Problem

KiwiAI Lab 2.5 kişilik bir ekip (Kıvanç + Claude). En kıt kaynak **zaman/odak**; dağılma en büyük risk. Satış-operasyonu (lead bulma, outreach, yanıt takibi, toplantı, içerik, raporlama) elle yürütülünce hem zaman yiyor hem de tutarsız ilerliyor. Eski sistem (n8n, `ops.kiwiailab.com`) çalışıyor ama dağınık: iki nesil yan yana, mükerrer brifing mantığı, repo↔prod drift, güvenlik borçları.

## Vizyon

**Crew OS**, KiwiAI Lab'in satış-operasyonunu yürüten tek **agentic işletim sistemi**dir. Bir "AI COO" gibi davranır: her sabah durumu okur, bir plan + öneri çıkarır, insan onayıyla aksiyonları dağıtır, ve onay/red pattern'lerinden öğrenerek zamanla daha otonom hale gelir. Sıkıcı/tekrarlı işi (outreach gönder, yanıt sınıfla, içerik üret, rapor çıkar) ajanlar yapar; insan **yön ve onay** verir.

**Felsefe — build-vs-buy:** Metalaşmış tesisatı (CRM UI = Twenty, sosyal yayın = Postiz) açık kaynaktan al; farklılaştıran **agentic zekâyı** (Hermes outreach, Frida içerik, brifing beyni, onay-öğrenme döngüsü) kendin sahiplen.

## Hedef Kullanıcı

- **Birincil (v0.1):** KiwiAI Lab'in kendisi — dogfood. Kıvanç dashboard'dan onay verir, ajanlar çalışır.
- **İkincil (ileride, zorlanmadan):** Benzer ihtiyacı olan KOBİ'ler — Hermes/Frida tek başına da hizmet olarak satılabilir; çok-tenant temeli bu yüzden korunur.

## Değer Önerisi

- **Zaman/odak kazancı:** Satış-ops'un rutin yükü otomatikleşir; 2.5 kişi 10 kişilik iş çıkarır.
- **Tutarlılık:** Tek beyin, tek veri kaynağı (Twenty), tek onay akışı — dağınıklık biter.
- **Öğrenen sistem:** Graduated Autonomy + Reflexion ile zamanla daha az müdahale gerektirir (rakiplerde olmayan onay-öğrenme döngüsü).
- **Sahiplik:** Açık kaynak + kendi kodumuz; vendor lock-in yok, veri bizde.

## Neden Şimdi / Neden Sıfırdan

Eski sistemin değeri kanıtlanmış tek parçası Hermes'ti; gerisi prototip/borçtu. v3 yeniden yazımı çekirdeği temizledi (Anthropic-only, multi-tenant, 44 test). Crew OS, bu temiz çekirdeği **yeni repoya taşıyıp** üstüne Twenty/Postiz tesisatını ve kendi dashboard'ını ekleyerek "dağınık iki nesil"i tek, sağlam, satılabilir bir motora dönüştürür.
