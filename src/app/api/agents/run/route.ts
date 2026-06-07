/**
 * POST /api/agents/run — sabah brifing pipeline'ını çalıştırır (tenant-scoped, auth'lu).
 * Brifingi üretir, crew_runs/crew_decisions'a yazar; pending aksiyonları dashboard'a düşürür.
 * Gerçek LLM çağrıları (ANTHROPIC_API_KEY gerekir).
 */
import { NextResponse } from "next/server";
import { withTenant } from "@/lib/api/withTenant";
import { runBriefingPipeline } from "@/lib/agents/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

export const POST = withTenant(async ({ tenant }) => {
  const result = await runBriefingPipeline(tenant.slug);
  return NextResponse.json(result);
});
