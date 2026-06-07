/**
 * Faz 3 dry-run — gerçek lokal Postgres + STUB ajanlar (LLM yok).
 * Pipeline orkestrasyonu + critic döngüsü + graduated autonomy + dispatch + dashboard pending
 * kayıtlarını uçtan uca doğrular. Tüm test verisi 'DRYRUN' ön ekiyle işaretlenir ve TEMİZLENİR.
 *
 * Çalıştır: `npm run crew:dryrun`
 */
import assert from "node:assert/strict";
import { and, eq, like, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { resolveTenant, clearTenantCache, type ResolvedTenant } from "@/lib/tenant";
import { runBriefingPipeline, type AgentRunners } from "@/lib/agents/pipeline";
import type { ConductorEmail, CriticReview, ScoutData, Strategy } from "@/lib/agents/types";

async function cleanup(tenantId: string): Promise<void> {
  await db.delete(schema.crewDecisions).where(
    and(eq(schema.crewDecisions.tenantId, tenantId), like(schema.crewDecisions.actionTitle, "DRYRUN%")),
  );
  // dry-run'da üretilen run'ları sil (result_json içinde DRYRUN geçenler güvenli değil → sadece bu testin runId'leri silinir, aşağıda).
}

// --- STUB ajanlar ---
const stubScout = async (_t: ResolvedTenant): Promise<ScoutData> => ({
  metrics_summary: "DRYRUN metrik",
  kb_insights: [],
  lessons_context: [],
  web_insights: [],
  opportunities: ["fırsat"],
  risks: ["risk"],
});

let criticCalls = 0;
const stubStrategist = async (): Promise<Strategy> => ({
  analysis: "DRYRUN analiz",
  actions: [{ id: 1, title: "t", priority: "high", impact: "i", steps: "s", type: "outreach" }],
  focus_of_the_day: "odak",
});
// İlk turda reddet, ikinci turda onayla → critic döngüsünü test et.
const stubCritic = async (): Promise<CriticReview> => {
  criticCalls += 1;
  return criticCalls < 2
    ? { approved: false, score: 4, feedback: "DRYRUN daha somut ol" }
    : { approved: true, score: 8, feedback: "ok" };
};
const stubConductor = async (): Promise<ConductorEmail> => ({
  subject: "DRYRUN Brifing",
  body: "Günaydın.",
  pending_actions: [
    { id: 1, category: "OUTREACH", description: "DRYRUN 15 email gönder" }, // yüksek geçmiş → auto-approve
    { id: 2, category: "ICERIK", description: "DRYRUN blog yaz" }, //          düşük geçmiş → auto-reject
    { id: 3, category: "CRM", description: "DRYRUN pipeline temizle" }, //     orta → needs approval
  ],
});

const STUBS: Partial<AgentRunners> = {
  scout: stubScout,
  strategist: stubStrategist,
  critic: stubCritic,
  conductor: stubConductor,
};

async function main(): Promise<void> {
  clearTenantCache();
  const tenant = await resolveTenant("kiwi");
  await cleanup(tenant.id);

  // --- Geçmiş karar seed'i (graduated autonomy oranları) ---
  const hist: Array<{ cat: string; status: string }> = [
    ...Array(9).fill({ cat: "OUTREACH", status: "approved" }),
    { cat: "OUTREACH", status: "rejected" }, // OUTREACH %90
    { cat: "ICERIK", status: "approved" },
    ...Array(7).fill({ cat: "ICERIK", status: "rejected" }), // ICERIK ~%12
    ...Array(3).fill({ cat: "CRM", status: "approved" }),
    ...Array(2).fill({ cat: "CRM", status: "rejected" }), // CRM %60
  ];
  await db.insert(schema.crewDecisions).values(
    hist.map((h) => ({
      tenantId: tenant.id,
      actionTitle: "DRYRUN history",
      actionType: h.cat,
      status: h.status,
      decidedBy: "dryrun-seed",
    })),
  );

  // --- Pipeline (stub ajanlar, Hermes dry-run) ---
  const res = await runBriefingPipeline("kiwi", { agents: STUBS, dryRun: true });

  // 1) Critic döngüsü 2 turda onaylandı
  assert.equal(res.metadata.iterations, 2, "critic 1 red + 1 onay = 2 iterasyon");
  console.log("✓ critic döngüsü: 2 iterasyon (1 red → 1 onay)");

  // 2) Graduated autonomy doğru ayırdı
  assert.deepEqual(res.auto_approved_actions.map((a) => a.category), ["OUTREACH"]);
  assert.deepEqual(res.auto_rejected_actions.map((a) => a.category), ["ICERIK"]);
  assert.deepEqual(res.pending_actions.map((a) => a.category), ["CRM"]);
  console.log("✓ graduated autonomy: OUTREACH→auto-approve, ICERIK→auto-reject, CRM→needs-approval");

  // 3) crew_runs tamamlandı
  const run = await db.query.crewRuns.findFirst({ where: eq(schema.crewRuns.runId, res.runId) });
  assert.equal(run?.status, "completed");
  assert.ok(run?.resultJson, "result_json yazıldı");
  console.log("✓ crew_runs: 'completed' + result_json kaydedildi");

  // 4) Bu run'a ait karar kayıtları (auto_approved + auto_rejected + pending)
  const runDecisions = await db
    .select({ status: schema.crewDecisions.status, cat: schema.crewDecisions.actionType })
    .from(schema.crewDecisions)
    .where(eq(schema.crewDecisions.runId, res.runId));
  const byStatus = (s: string) => runDecisions.filter((d) => d.status === s).map((d) => d.cat);
  assert.deepEqual(byStatus("auto_approved"), ["OUTREACH"]);
  assert.deepEqual(byStatus("auto_rejected"), ["ICERIK"]);
  assert.deepEqual(byStatus("pending"), ["CRM"]);
  console.log("✓ crew_decisions: auto_approved/auto_rejected/pending kayıtları runId'e bağlı");

  // 5) Dashboard onayı simülasyonu: pending CRM kararını onayla (endpoint mantığı)
  const pending = await db.query.crewDecisions.findFirst({
    where: and(eq(schema.crewDecisions.runId, res.runId), eq(schema.crewDecisions.status, "pending")),
  });
  assert.ok(pending, "pending karar var");
  await db
    .update(schema.crewDecisions)
    .set({ status: "approved", decidedBy: "dashboard-user", decidedAt: new Date() })
    .where(eq(schema.crewDecisions.id, pending!.id));
  const after = await db.query.crewDecisions.findFirst({ where: eq(schema.crewDecisions.id, pending!.id) });
  assert.equal(after?.status, "approved");
  console.log("✓ dashboard tek-tık: pending CRM → approved");

  // 6) Brifing gövdesinde autonomy özeti
  assert.match(res.body, /OTOMATİK ONAYLANAN/);
  assert.match(res.body, /OTOMATİK REDDEDİLEN/);
  console.log("✓ brifing gövdesi: autonomy özeti eklendi");

  // --- Temizlik ---
  await db.delete(schema.crewDecisions).where(eq(schema.crewDecisions.runId, res.runId));
  await db.delete(schema.crewRuns).where(eq(schema.crewRuns.runId, res.runId));
  await cleanup(tenant.id);
  // Dispatch'in Hermes'i açtığında oluşabilecek artığı temizle (hermes disabled olduğundan beklenmez).
  console.log("✓ temizlik tamam");
}

main()
  .then(() => {
    console.log("\nCREW DRY-RUN BAŞARILI — tüm assert'ler geçti.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("CREW DRY-RUN HATASI:", err);
    process.exit(1);
  });
