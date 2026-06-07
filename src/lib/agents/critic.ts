/**
 * Critic (Haiku) — Strategist planını eleştirir; onay/gerekçeli red. Belirsiz aksiyonları reddeder.
 */
import { completeJson } from "@/lib/llm/client";
import type { ResolvedTenant } from "@/lib/tenant";
import { buildTenantProfile } from "@/lib/tenant";
import type { CriticReview, Strategy } from "./types.js";

const CRITIC_SYSTEM = (profile: string) => `Sen bir Critic (eleştirmen) ajansın. Şirket profili:
${profile}

Görevin: Strategist'in aksiyon planını eleştir. Her aksiyonun gerçekçi, bugün uygulanabilir ve etkili
olup olmadığını değerlendir. Belirsiz/çok genel aksiyonları reddet. Kaynak sınırlı olduğunu unutma.

Çıktı formatı (yalnız JSON):
{"approved":true,"score":8,"feedback":"...","action_reviews":[{"id":1,"ok":true,"comment":"..."}]}`;

export async function runCritic(tenant: ResolvedTenant, plan: Strategy): Promise<CriticReview> {
  const user = `## Aksiyon Planı\n${JSON.stringify(plan, null, 2)}\n\nBu planı eleştir. Onaylıyor musun?`;
  const fallback: CriticReview = { approved: true, score: 5, feedback: "", action_reviews: [] };
  const { data } = await completeJson<CriticReview>(
    { tier: "haiku", system: CRITIC_SYSTEM(buildTenantProfile(tenant)), user, temperature: 0.3, maxTokens: 1200 },
    fallback,
  );
  return data;
}
