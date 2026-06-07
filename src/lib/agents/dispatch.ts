/**
 * Onaylanan aksiyon dispatch'i — eski n8n webhook mapping'inin v3 karşılığı.
 * n8n YOK: OUTREACH/EMAIL mevcut Hermes'i tetikler; diğer kategoriler için executor Faz 4'te (stub).
 */
import type { ResolvedTenant } from "@/lib/tenant";
import { runSequenceSender } from "@/lib/hermes/sequence-sender";
import type { PendingAction } from "./types.js";

export interface DispatchResult {
  actionId: number;
  category: string;
  dispatched: boolean;
  detail: string;
}

export async function dispatchAction(
  tenant: ResolvedTenant,
  action: PendingAction,
  opts: { dryRun?: boolean } = {},
): Promise<DispatchResult> {
  const cat = (action.category || "DIGER").toUpperCase();

  if (cat === "OUTREACH" || cat === "EMAIL") {
    try {
      const res = await runSequenceSender(tenant.slug, { dryRun: opts.dryRun });
      return {
        actionId: action.id,
        category: cat,
        dispatched: true,
        detail: `Hermes tetiklendi: sent=${res.sent} (${res.transport})${res.reason ? ` reason=${res.reason}` : ""}`,
      };
    } catch (err) {
      return { actionId: action.id, category: cat, dispatched: false, detail: `Hermes hatası: ${(err as Error).message}` };
    }
  }

  // ICERIK / CRM / ARASTIRMA / DIGER → executor Faz 4'te.
  return {
    actionId: action.id,
    category: cat,
    dispatched: false,
    detail: "executor_not_implemented (Faz 4)",
  };
}
