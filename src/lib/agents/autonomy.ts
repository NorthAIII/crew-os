/**
 * Graduated Autonomy — saf sınıflandırma (DB/LLM bağımlılığı yok, CI-güvenli test).
 * Kategori onay oranına göre pending aksiyonları otomatik onay/red/insan-onayı kovalarına ayırır.
 * Eşikler ürün politikası (marka değeri değil) → koda gömülü sabit.
 */
import type { ApprovalRates, PendingAction } from "./types.js";

export const AUTO_APPROVE_RATE = 80; // ≥ bu oran (%) → otomatik onay
// (devamı aşağıda)
export const AUTO_APPROVE_MIN = 3; //  ve ≥ bu toplam karar (güven)
export const AUTO_REJECT_RATE = 20; // ≤ bu oran (%) → otomatik red
export const AUTO_REJECT_MIN = 3;

export interface AutonomyBuckets {
  autoApproved: PendingAction[];
  autoRejected: PendingAction[];
  needsApproval: PendingAction[];
}

export function classifyActions(
  pendingActions: PendingAction[],
  rates: ApprovalRates,
): AutonomyBuckets {
  const autoApproved: PendingAction[] = [];
  const autoRejected: PendingAction[] = [];
  const needsApproval: PendingAction[] = [];

  for (const action of pendingActions) {
    const cat = action.category || "DIGER";
    const info = rates[cat];
    const rate = info?.approval_rate ?? 0;
    const total = info?.total ?? 0;

    if (rate >= AUTO_APPROVE_RATE && total >= AUTO_APPROVE_MIN) {
      autoApproved.push(action);
    } else if (rate <= AUTO_REJECT_RATE && total >= AUTO_REJECT_MIN) {
      autoRejected.push(action);
    } else {
      needsApproval.push(action);
    }
  }

  return { autoApproved, autoRejected, needsApproval };
}

/** Saf: onay oranlarından okunabilir autonomy bağlamı (yüksek/düşük/orta kovaları). */
export function buildAutonomyContext(rates: ApprovalRates): string {
  const keys = Object.keys(rates);
  if (keys.length === 0) return "Henüz yeterli veri yok — tüm kategoriler onay beklesin.";

  const lines = ["Kategori bazlı onay oranları (son 30 gün):"];
  const high: string[] = [];
  const low: string[] = [];
  const mid: string[] = [];
  for (const cat of keys) {
    const info = rates[cat];
    lines.push(`  ${cat}: %${info.approval_rate} (${info.approved} onay / ${info.rejected} red, toplam ${info.total})`);
    if (info.approval_rate >= AUTO_APPROVE_RATE && info.total >= AUTO_APPROVE_MIN) high.push(cat);
    else if (info.approval_rate <= AUTO_REJECT_RATE && info.total >= AUTO_REJECT_MIN) low.push(cat);
    else mid.push(cat);
  }
  if (high.length) lines.push(`\n✅ OTOMATIK ONAY (önermeye devam): ${high.join(", ")}`);
  if (low.length) lines.push(`\n🚫 ÖNERME (hep reddediliyor): ${low.join(", ")}`);
  if (mid.length) lines.push(`\n⏳ NORMAL ONAY: ${mid.join(", ")}`);
  return lines.join("\n");
}

/** Saf: brifing gövdesine eklenen onay bloğu (LLM eklemeyi unutursa garanti). */
export function buildApprovalBlock(actions: PendingAction[]): string {
  if (!actions.length) return "";
  const lines = ["\n---", "ONAY BEKLEYENLER (dashboard'dan onayla/reddet):"];
  for (const a of actions) lines.push(`[${a.id}] [${a.category}] ${a.description}`);
  lines.push("---");
  return lines.join("\n");
}
