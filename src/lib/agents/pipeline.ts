/**
 * Brifing pipeline orkestratörü (crew-os pipeline.py portu).
 * approval-rates → Scout → Strategist↔Critic (max 3) → Conductor → Graduated Autonomy → dispatch.
 *
 * Ajanlar enjekte edilebilir (opts.agents) → LLM olmadan dry-run/test. Onay akışı dashboard:
 * needs_approval aksiyonları crew_decisions(status='pending') olarak yazılır (dashboard listeler).
 */
import { resolveTenant, type ResolvedTenant } from "@/lib/tenant";
import { runScout } from "./scout.js";
import { runStrategist } from "./strategist.js";
import { runCritic } from "./critic.js";
import { runConductor } from "./conductor.js";
import { classifyActions } from "./autonomy.js";
import { dispatchAction } from "./dispatch.js";
import {
  completeRun,
  fetchApprovalRates,
  saveDecision,
  saveRun,
} from "./metrics.js";
import type {
  BriefingResult,
  ConductorEmail,
  CriticReview,
  ScoutData,
  Strategy,
} from "./types.js";

export const MAX_CRITIC_LOOPS = 3;

export interface AgentRunners {
  scout: (t: ResolvedTenant) => Promise<ScoutData>;
  strategist: (t: ResolvedTenant, s: ScoutData, fb?: string | null) => Promise<Strategy>;
  critic: (t: ResolvedTenant, plan: Strategy) => Promise<CriticReview>;
  conductor: (
    t: ResolvedTenant,
    s: ScoutData,
    st: Strategy,
    cr: CriticReview,
    rates: import("./types.js").ApprovalRates,
  ) => Promise<ConductorEmail>;
}

const REAL_AGENTS: AgentRunners = {
  scout: runScout,
  strategist: runStrategist,
  critic: runCritic,
  conductor: runConductor,
};

export interface PipelineOptions {
  agents?: Partial<AgentRunners>;
  dispatch?: boolean; // auto-approved aksiyonları gerçekten tetikle (varsayılan true)
  dryRun?: boolean; // dispatch Hermes'i dry-run modda çağırır
  decidedBy?: string;
}

export async function runBriefingPipeline(
  slug?: string,
  opts: PipelineOptions = {},
): Promise<BriefingResult> {
  const agents = { ...REAL_AGENTS, ...opts.agents };
  const tenant = await resolveTenant(slug);
  const decidedBy = opts.decidedBy ?? "crew-os-autonomy";

  const rates = await fetchApprovalRates(tenant.id);
  const runId = await saveRun(tenant.id, "running");

  // Scout
  let scoutData: ScoutData;
  try {
    scoutData = await agents.scout(tenant);
  } catch (e) {
    scoutData = { metrics_summary: `Scout hatası: ${e}`, kb_insights: [], lessons_context: [], web_insights: [], opportunities: [], risks: [] };
  }

  // Strategist ↔ Critic döngüsü
  let strategy: Strategy = { analysis: "", actions: [], focus_of_the_day: "" };
  let critic: CriticReview = { approved: true, score: 5, feedback: "" };
  let feedback: string | null = null;
  let iterations = 0;
  for (let i = 1; i <= MAX_CRITIC_LOOPS; i++) {
    iterations = i;
    strategy = await agents.strategist(tenant, scoutData, feedback);
    critic = await agents.critic(tenant, strategy);
    if (critic.approved) break;
    feedback = critic.feedback || "Plan yeterli değil, iyileştir.";
  }

  // Conductor
  const email = await agents.conductor(tenant, scoutData, strategy, critic, rates);

  // Graduated Autonomy
  const { autoApproved, autoRejected, needsApproval } = classifyActions(email.pending_actions ?? [], rates);

  const dispatchResults: string[] = [];
  for (const action of autoApproved) {
    await saveDecision(tenant.id, action, "auto_approved", decidedBy, runId);
    if (opts.dispatch !== false) {
      const r = await dispatchAction(tenant, action, { dryRun: opts.dryRun });
      dispatchResults.push(`[${action.id}] ${r.detail}`);
    }
  }
  for (const action of autoRejected) {
    await saveDecision(tenant.id, action, "auto_rejected", decidedBy, runId);
  }
  // Dashboard onayı: needs_approval → pending kayıt (kullanıcı tek-tıkla karar verir).
  for (const action of needsApproval) {
    await saveDecision(tenant.id, action, "pending", "dashboard", runId);
  }

  // Brifing gövdesine autonomy özeti ekle
  let body = email.body ?? "";
  if (autoApproved.length) {
    body += "\n\n---\n🤖 OTOMATİK ONAYLANAN (Graduated Autonomy):\n" + autoApproved.map((a) => `  ✅ [${a.category}] ${a.description}`).join("\n");
  }
  if (autoRejected.length) {
    body += "\n🚫 OTOMATİK REDDEDİLEN (geçmiş kararlara göre):\n" + autoRejected.map((a) => `  ❌ [${a.category}] ${a.description}`).join("\n");
  }

  const result: BriefingResult = {
    runId,
    subject: email.subject ?? "Brifing",
    body,
    pending_actions: needsApproval,
    auto_approved_actions: autoApproved,
    auto_rejected_actions: autoRejected,
    metadata: {
      iterations,
      graduated_autonomy: {
        auto_approved: autoApproved.length,
        auto_rejected: autoRejected.length,
        needs_approval: needsApproval.length,
        rates,
      },
    },
  };

  await completeRun(runId, "completed", { ...result, dispatch: dispatchResults });
  return result;
}
