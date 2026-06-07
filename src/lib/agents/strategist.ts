/**
 * Strategist (Sonnet) — Scout verisinden günlük aksiyon planı. Critic feedback'iyle yinelenir.
 * Tenant profili enjekte (şirket büyüklüğü/gerçekçilik prompt'a gömülü değil).
 */
import { completeJson } from "@/lib/llm/client";
import type { ResolvedTenant } from "@/lib/tenant";
import { buildTenantProfile } from "@/lib/tenant";
import type { ScoutData, Strategy } from "./types.js";

const STRATEGIST_SYSTEM = (profile: string) => `Sen bir Strategist (stratejist) ajansın. Şirket profili:
${profile}

Görevin: Scout'un verisini analiz et, bugün yapılması gereken GERÇEKÇİ aksiyonları belirle (şirketin
boyutuna uygun). Her aksiyon için öncelik, beklenen etki ve uygulama adımı yaz. Her zaman Türkçe.

Çıktı formatı (yalnız JSON):
{"analysis":"...","actions":[{"id":1,"title":"...","priority":"high|medium|low","impact":"...","steps":"...","type":"outreach|content|crm|research|other"}],"focus_of_the_day":"..."}`;

export async function runStrategist(
  tenant: ResolvedTenant,
  scoutData: ScoutData,
  criticFeedback?: string | null,
): Promise<Strategy> {
  let user = `## Scout Raporu\n${JSON.stringify(scoutData, null, 2)}\n`;
  if (criticFeedback) {
    user += `\n## Critic Feedback (önceki planın eleştirisi)\n${criticFeedback}\n\nBu eleştiriyi dikkate alarak planı güncelle.`;
  }
  user += "\n\nBugünkü aksiyon planını JSON formatında oluştur.";

  const fallback: Strategy = { analysis: "", actions: [], focus_of_the_day: "Analiz tamamlandı" };
  const { data } = await completeJson<Strategy>(
    { tier: "sonnet", system: STRATEGIST_SYSTEM(buildTenantProfile(tenant)), user, temperature: 0.5 },
    fallback,
  );
  return data;
}
