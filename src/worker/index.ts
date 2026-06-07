/**
 * Bunker OS worker — zamanlanmış ajan işleri (eski n8n cron'larının karşılığı).
 *
 * Şimdilik: Hermes sequence-sender her 4 saatte bir (eski hermes-sequence-sender cron'u).
 * WORKER_ENABLED=false ile kapatılır (CI/lokal). DEFAULT_TENANT_SLUG için çalışır;
 * multi-tenant'a geçişte tüm aktif tenant'lar üzerinde döner.
 *
 * Reply-handler tetikleyici (Gmail poll) Faz 2.x: refresh token gelince eklenecek;
 * mantık (handleReply) hazır ve test edilmiş.
 */
import cron from "node-cron";
import { runSequenceSender } from "@/lib/hermes/sequence-sender";
import { runReflexion } from "@/lib/agents/reflexion";
import { runOpsReport } from "@/lib/agents/ops";

const enabled = process.env.WORKER_ENABLED !== "false";
const slug = process.env.DEFAULT_TENANT_SLUG ?? "kiwi";

async function runHermes(): Promise<void> {
  try {
    const res = await runSequenceSender(slug);
    console.log(`[worker:hermes] sent=${res.sent} skipped=${res.skipped} transport=${res.transport}${res.reason ? ` reason=${res.reason}` : ""}`);
  } catch (err) {
    console.error("[worker:hermes] hata:", (err as Error).message);
  }
}

async function runOps(): Promise<void> {
  try {
    const r = await runOpsReport(slug);
    console.log(`[worker:ops] rapor gönderildi:\n${r.summary}`);
  } catch (err) {
    console.error("[worker:ops] hata:", (err as Error).message);
  }
}

async function runWeeklyReflexion(): Promise<void> {
  try {
    const r = await runReflexion(slug);
    console.log(`[worker:reflexion] status=${r.status}${r.lessonsSaved != null ? ` lessons=${r.lessonsSaved}` : ""}${r.reason ? ` reason=${r.reason}` : ""}`);
  } catch (err) {
    console.error("[worker:reflexion] hata:", (err as Error).message);
  }
}

function main(): void {
  if (!enabled) {
    console.log("[worker] WORKER_ENABLED=false → cron kurulmadı, çıkılıyor.");
    return;
  }
  // Hermes: her 4 saatte bir (00:00, 04:00, ...).
  cron.schedule("0 */4 * * *", runHermes);
  // Ops raporu: her gün 09:00 UTC.
  cron.schedule("0 9 * * *", runOps);
  // Reflexion: her Pazar 23:00 UTC (haftalık öğrenme).
  cron.schedule("0 23 * * 0", runWeeklyReflexion);
  console.log(`[worker] başladı (tenant=${slug}). Cron: Hermes 4h · Ops 09:00 · Reflexion Pazar 23:00.`);
}

main();
