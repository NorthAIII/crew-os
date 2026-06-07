/**
 * Haftalık Reflexion (Sonnet) — son 7 günün onay/red kararlarından pattern/öğrenim çıkarır,
 * crew_lessons'a yazar (Qdrant yerine sadece Postgres). Scout bu öğrenimleri okur → kapalı döngü.
 */
import { desc, eq, gt, and, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { resolveTenant, buildTenantProfile, type ResolvedTenant } from "@/lib/tenant";
import { completeJson } from "@/lib/llm/client";

const REFLEXION_SYSTEM = (profile: string) => `Sen bir öğrenme modülüsün. Şirket profili:
${profile}

Görevin: son 7 günün onay/red kararlarını analiz et, pattern'ler bul. Hangi kategoriler onaylanıyor/
reddediliyor? CEO'nun tercih pattern'i ne? Graduated autonomy için hangi kategoriler otomatik onaya uygun
(≥%80)? Türkçe, somut, kısa.

Çıktı formatı (yalnız JSON):
{"approval_rate":"75%","patterns":["..."],"learnings":["..."],"autonomy_recommendations":["..."],"summary":"..."}`;

interface ReflexionAnalysis {
  patterns?: string[];
  learnings?: string[];
  autonomy_recommendations?: string[];
  summary?: string;
}

export interface ReflexionResult {
  status: "completed" | "skipped";
  reason?: string;
  lessonsSaved?: number;
  analysis?: ReflexionAnalysis;
}

export async function runReflexion(slug?: string, tenantArg?: ResolvedTenant): Promise<ReflexionResult> {
  const tenant = tenantArg ?? (await resolveTenant(slug));

  const decisions = await db
    .select({
      title: schema.crewDecisions.actionTitle,
      category: schema.crewDecisions.actionType,
      status: schema.crewDecisions.status,
    })
    .from(schema.crewDecisions)
    .where(
      and(
        eq(schema.crewDecisions.tenantId, tenant.id),
        gt(schema.crewDecisions.decidedAt, sql`now() - interval '7 days'`),
      ),
    )
    .orderBy(desc(schema.crewDecisions.decidedAt));

  if (decisions.length === 0) {
    return { status: "skipped", reason: "Bu hafta karar yok" };
  }

  const user = `Son 7 günün kararları:\n${JSON.stringify(decisions, null, 2)}\n\nAnaliz et ve öğrenimleri JSON formatında raporla.`;
  const { data } = await completeJson<ReflexionAnalysis>(
    { tier: "sonnet", system: REFLEXION_SYSTEM(buildTenantProfile(tenant)), user, temperature: 0.4 },
    { patterns: [], learnings: [], autonomy_recommendations: [], summary: "" },
  );

  const toSave: Array<{ category: string; content: string }> = [
    ...(data.learnings ?? []).map((c) => ({ category: "reflexion", content: c })),
    ...(data.patterns ?? []).map((c) => ({ category: "pattern", content: c })),
    ...(data.autonomy_recommendations ?? []).map((c) => ({ category: "autonomy", content: c })),
  ];

  for (const lesson of toSave) {
    await db.insert(schema.crewLessons).values({
      tenantId: tenant.id,
      category: lesson.category,
      content: lesson.content,
      sourceRun: "reflexion",
    });
  }

  return { status: "completed", lessonsSaved: toSave.length, analysis: data };
}
