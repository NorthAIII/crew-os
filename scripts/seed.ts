/**
 * Faz 1 — kiwi tenant + tenant_config seed.
 *
 * İLKE: Eski sistemde prompt/SQL içine GÖMÜLÜ olan her kiwi-sabiti (marka, sender,
 * Cal.com linki, Slack kanalı, segmentler, hedef pazarlar, maliyet) yalnız BURADA
 * yaşar → DB'ye yazılır → runtime'da tenant_config'ten okunur. Kodda hiçbir kiwi
 * değeri sabit değildir. White-label = yeni tenant satırı + yeni config.
 *
 * Idempotent: tekrar çalıştırılınca upsert eder (onConflictDoUpdate).
 *
 * Kaynak değerler (DOĞRULANDI: docs/SISTEM-ANALIZI-RAPORU.md):
 *  - eski tenant UUID 97e72263-... (hermes-sequence-sender.json:33) → Faz 5 veri taşıma sürekliliği için yeniden kullanılır.
 *  - CC kivanc@kiwiailab.com (:111), Slack DM D0ANYQWFY10 (:173), maliyet $170/mo (Apollo $70+Hetzner $70+Claude ~$30),
 *    hedef pazar Vancouver/Kelowna/Vernon (:144), beauty-bc segmenti (:119).
 *
 * NOT (DOĞRULANMADI): Cal.com link slug'ı raporda tam geçmiyor (reply-handler:215 "kişisel link").
 *   Aşağıdaki değer makul placeholder — Faz 2 öncesi kullanıcıdan teyit edilecek.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { resolveTenant, clearTenantCache } from "@/lib/tenant";

// Eski prod tenant UUID'si — veri taşıma sürekliliği için sabit tutulur.
const KIWI_TENANT_ID = "97e72263-52c6-4e79-9f5a-2095533d6c93";

async function seed(): Promise<void> {
  // 1) Tenant satırı
  await db
    .insert(schema.tenants)
    .values({ id: KIWI_TENANT_ID, slug: "kiwi", name: "KiwiAI Lab" })
    .onConflictDoUpdate({
      target: schema.tenants.slug,
      set: { name: "KiwiAI Lab" },
    });

  // 2) tenant_config — eski koddaki tüm kiwi sabitleri
  await db
    .insert(schema.tenantConfig)
    .values({
      tenantId: KIWI_TENANT_ID,
      brandName: "KiwiAI Lab",
      senderEmail: "hermes@kiwiailab.com", // GMAIL_SENDER ile hizalı (gerçek gönderim kimliği env'de)
      senderName: "Kivanç — KiwiAI Lab",
      ccEmail: "kivanc@kiwiailab.com",
      calLink: "https://cal.com/kiwiailab/discovery", // DOĞRULANMADI — Faz 2 öncesi teyit
      slackChannel: "D0ANYQWFY10",
      websiteUrl: "https://kiwiailab.com",
      segments: ["beauty-bc", "real-estate-bc", "ecommerce", "agency"],
      targetMarkets: ["Vancouver", "Kelowna", "Vernon"],
      monthlyCostsUsd: "170",
      pricing: {
        model: "discovery-call-then-custom-quote",
        publicPricingPage: false,
        note: "Fiyat sayfası yok → discovery call → özel teklif",
        dealSizeUsdMonthly: { min: 1000, typical: 3000, max: 8000 },
      },
      businessContext:
        "KiwiAI Lab — KOBİ'ler için 'agentic systems' (AI ajan sistemleri) kuran lab. " +
        "Ürünler: Bunker OS (operasyon/outreach motoru), AI Web, AI Integration. " +
        "Konumlandırma: 'Agentic Systems' (NOT 'AI Agency'). Fiyat sayfası yok; discovery call → özel teklif. " +
        "Ana mesaj: 'Bunu kendi şirketimizde kullanıyoruz' (dogfood). Birincil pazar: British Columbia, Kanada.",
    })
    .onConflictDoUpdate({
      target: schema.tenantConfig.tenantId,
      set: {
        brandName: "KiwiAI Lab",
        senderEmail: "hermes@kiwiailab.com",
        senderName: "Kivanç — KiwiAI Lab",
        ccEmail: "kivanc@kiwiailab.com",
        calLink: "https://cal.com/kiwiailab/discovery",
        slackChannel: "D0ANYQWFY10",
        websiteUrl: "https://kiwiailab.com",
        segments: ["beauty-bc", "real-estate-bc", "ecommerce", "agency"],
        targetMarkets: ["Vancouver", "Kelowna", "Vernon"],
        monthlyCostsUsd: "170",
        updatedAt: new Date(),
      },
    });

  // 3) hermes_settings — outreach kapasitesi + sekans politikası.
  //    enabled=false: GÜVENLİ varsayılan (prod'da kasıtlı açılana dek gönderim yok).
  //    maxSteps/stepIntervalDays: eski sistemde hardcode olan 3 adım / +4 gün → config.
  await db
    .insert(schema.hermesSettings)
    .values({ tenantId: KIWI_TENANT_ID, enabled: false, dailyCap: 20, maxSteps: 3, stepIntervalDays: 4 })
    .onConflictDoUpdate({
      target: schema.hermesSettings.tenantId,
      set: { maxSteps: 3, stepIntervalDays: 4, updatedAt: new Date() },
    });

  // NOT: hermes_templates (gerçek e-posta copy'si) ve leadler Faz 5'te eski Postgres'ten
  // taşınacak — burada sahte içerik seed'lenmez. Faz 2 dry-run testi kendi geçici verisini kurar.

  // Doğrulama: resolveTenant + profil enjeksiyonu çalışıyor mu?
  clearTenantCache();
  const t = await resolveTenant("kiwi");
  console.log("✓ Tenant seed tamam:", t.slug, "/", t.config.brandName);
  console.log("✓ Tenant profili (prompt'a enjekte edilen):\n");
  const { buildTenantProfile } = await import("@/lib/tenant");
  console.log(buildTenantProfile(t));
}

seed()
  .then(() => {
    console.log("\nSeed başarılı.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed hatası:", err);
    process.exit(1);
  });
