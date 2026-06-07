/**
 * Saf sekans politikası — DB/IO bağımlılığı YOK (CI-güvenli birim test).
 */

/** Bir gönderim sonrası leadin yeni sekans durumu. */
export function computeLeadAdvance(
  currentStep: number,
  maxSteps: number,
  stepIntervalDays: number,
  now: Date,
): { nextStep: number; nextFollowupAt: Date | null; sequenceStatus: "active" | "completed" } {
  const nextStep = currentStep + 1;
  const done = nextStep >= maxSteps;
  return {
    nextStep,
    sequenceStatus: done ? "completed" : "active",
    nextFollowupAt: done ? null : new Date(now.getTime() + stepIntervalDays * 86_400_000),
  };
}
