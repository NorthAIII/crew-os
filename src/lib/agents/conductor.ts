/**
 * Conductor (Sonnet) — sabah brifing e-postası + onay-bekleyen aksiyonlar.
 * Graduated Autonomy bağlamını prompt'a verir; düşük onay oranlı kategorilerden aksiyon önermez.
 * Onay akışı = dashboard tek-tık (eski "emaile cevapla" formatı yerine).
 */
import { completeJson } from "@/lib/llm/client";
import type { ResolvedTenant } from "@/lib/tenant";
import { buildTenantProfile } from "@/lib/tenant";
import {
  AUTO_APPROVE_RATE,
  AUTO_REJECT_RATE,
  buildApprovalBlock,
  buildAutonomyContext,
} from "./autonomy.js";
import type { ApprovalRates, ConductorEmail, CriticReview, ScoutData, Strategy } from "./types.js";

export { buildApprovalBlock, buildAutonomyContext } from "./autonomy.js";

const CONDUCTOR_SYSTEM = (profile: string) => `Sen şirketin AI COO'susun. CEO'ya her sabah Türkçe brifing e-postası yazarsın. Şirket profili:
${profile}

Kurallar:
- Samimi ama profesyonel ton; somut ve kısa
- Metrikleri vurgula (sayı, yüzde)
- Bugün yapılacaklar: öncelik sırasıyla, MAX 3-5 aksiyon
- Her aksiyon SOMUT sayı + KANAL/ARAÇ içermeli, TEK CÜMLE
- Kötü örnek: "Outreach stratejisini geliştir" / İyi örnek: "X segmentine 15 yeni email gönder (Hermes)"

Graduated Autonomy: Sana kategori bazlı onay oranları verilir.
- Yüksek onaylı (≥%${AUTO_APPROVE_RATE}): bu kategorilerde önermeye devam et (otomatik onaylanır).
- Düşük onaylı (≤%${AUTO_REJECT_RATE}): bu kategorilerden aksiyon ÖNERME (hep reddediliyor).
- Orta: normal onay listesine ekle.
Her onay maddesinin başında kategori olmalı: OUTREACH, EMAIL, ICERIK, CRM, ARASTIRMA, DIGER.
Onaylar dashboard'dan tek tıkla verilir.

Çıktı formatı (yalnız JSON):
{"subject":"...","body":"...","pending_actions":[{"id":1,"category":"OUTREACH","description":"..."}]}`;

export async function runConductor(
  tenant: ResolvedTenant,
  scoutData: ScoutData,
  strategy: Strategy,
  criticReview: CriticReview,
  approvalRates: ApprovalRates,
): Promise<ConductorEmail> {
  const user = `## Scout\n${JSON.stringify(scoutData, null, 2)}

## Strateji
${JSON.stringify(strategy, null, 2)}

## Critic
${JSON.stringify(criticReview, null, 2)}

## Graduated Autonomy — Onay Oranları
${buildAutonomyContext(approvalRates)}

CEO'ya sabah brifing e-postasını yaz. Düşük onaylı kategorilerden aksiyon önerme; onay bekleyenler bölümünü ekle. JSON döndür.`;

  const fallback: ConductorEmail = { subject: "Brifing", body: "", pending_actions: [] };
  const { data } = await completeJson<ConductorEmail>(
    { tier: "sonnet", system: CONDUCTOR_SYSTEM(buildTenantProfile(tenant)), user, temperature: 0.6 },
    fallback,
  );

  // Onay bloğu yoksa programatik ekle.
  if (data.pending_actions?.length && !data.body.includes("ONAY BEKLEYENLER")) {
    data.body += buildApprovalBlock(data.pending_actions);
  }
  return data;
}
