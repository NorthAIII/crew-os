/**
 * Brifing pipeline DB katmanı — v3 şemasına uyarlandı (crew-os database.py portu).
 * Eski outreach_campaigns tablosu yok → outreach metrikleri hermes_emails'ten.
 * crew_os_decisions/runs/lessons → v3 crew_decisions/crew_runs/crew_lessons.
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ApprovalRates, PendingAction } from "./types.js";

/** Son 30 gün, kategori bazlı onay oranları (graduated autonomy girdisi). */
export async function fetchApprovalRates(tenantId: string): Promise<ApprovalRates> {
  const rows = await db
    .select({
      actionType: schema.crewDecisions.actionType,
      total: sql<number>`count(*)::int`,
      approved: sql<number>`count(*) FILTER (WHERE ${schema.crewDecisions.status} IN ('approved','auto_approved'))::int`,
      rejected: sql<number>`count(*) FILTER (WHERE ${schema.crewDecisions.status} IN ('rejected','auto_rejected'))::int`,
    })
    .from(schema.crewDecisions)
    .where(
      and(
        eq(schema.crewDecisions.tenantId, tenantId),
        gt(schema.crewDecisions.decidedAt, sql`now() - interval '30 days'`),
        sql`${schema.crewDecisions.actionType} IS NOT NULL`,
      ),
    )
    .groupBy(schema.crewDecisions.actionType);

  const rates: ApprovalRates = {};
  for (const r of rows) {
    const total = r.total;
    rates[r.actionType ?? "DIGER"] = {
      total,
      approved: r.approved,
      rejected: r.rejected,
      approval_rate: total > 0 ? Math.round((r.approved / total) * 100) : 0,
    };
  }
  return rates;
}

export async function saveRun(tenantId: string, status: string): Promise<string> {
  const runId = `run_${randomUUID()}`;
  await db.insert(schema.crewRuns).values({ runId, tenantId, status });
  return runId;
}

export async function completeRun(
  runId: string,
  status: string,
  resultJson: Record<string, unknown>,
): Promise<void> {
  await db
    .update(schema.crewRuns)
    .set({ status, resultJson, completedAt: new Date() })
    .where(eq(schema.crewRuns.runId, runId));
}

export async function saveDecision(
  tenantId: string,
  action: PendingAction,
  decision: string,
  decidedBy: string,
  runId?: string,
): Promise<void> {
  await db.insert(schema.crewDecisions).values({
    tenantId,
    runId: runId ?? null,
    actionTitle: action.description,
    actionType: action.category,
    status: decision,
    decidedBy,
  });
}

export async function fetchRecentLessons(
  tenantId: string,
  limit = 10,
): Promise<Array<{ category: string | null; content: string }>> {
  const rows = await db
    .select({ category: schema.crewLessons.category, content: schema.crewLessons.content })
    .from(schema.crewLessons)
    .where(eq(schema.crewLessons.tenantId, tenantId))
    .orderBy(desc(schema.crewLessons.createdAt))
    .limit(limit);
  return rows;
}

/** Scout için lead/outreach/meeting metrikleri (v3 tabloları). */
export async function fetchLeadMetrics(tenantId: string): Promise<Record<string, unknown>> {
  const tenantLeads = and(eq(schema.leads.tenantId, tenantId));

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(schema.leads)
    .where(tenantLeads);
  const [{ recent }] = await db
    .select({ recent: sql<number>`count(*)::int` })
    .from(schema.leads)
    .where(and(tenantLeads, gt(schema.leads.createdAt, sql`now() - interval '7 days'`)));
  const [{ outreachSent }] = await db
    .select({ outreachSent: sql<number>`count(*)::int` })
    .from(schema.hermesEmails)
    .where(
      and(
        eq(schema.hermesEmails.tenantId, tenantId),
        eq(schema.hermesEmails.direction, "out"),
        gt(schema.hermesEmails.sentAt, sql`now() - interval '7 days'`),
      ),
    );
  const [{ replies }] = await db
    .select({ replies: sql<number>`count(*)::int` })
    .from(schema.hermesEmails)
    .where(
      and(
        eq(schema.hermesEmails.tenantId, tenantId),
        eq(schema.hermesEmails.direction, "in"),
        gt(schema.hermesEmails.createdAt, sql`now() - interval '7 days'`),
      ),
    );
  const [{ meetingsCount }] = await db
    .select({ meetingsCount: sql<number>`count(*)::int` })
    .from(schema.meetings)
    .where(
      and(eq(schema.meetings.tenantId, tenantId), gt(schema.meetings.createdAt, sql`now() - interval '7 days'`)),
    );
  const statusRows = await db
    .select({ status: schema.leads.status, cnt: sql<number>`count(*)::int` })
    .from(schema.leads)
    .where(tenantLeads)
    .groupBy(schema.leads.status)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  return {
    total_leads: total,
    new_leads_7d: recent,
    outreach_emails_sent_7d: outreachSent,
    replies_7d: replies,
    meetings_7d: meetingsCount,
    leads_by_status: Object.fromEntries(statusRows.map((r) => [r.status, r.cnt])),
  };
}

/** Pipeline istatistikleri (hermes + meetings + son run'lar). */
export async function fetchPipelineStats(tenantId: string): Promise<Record<string, unknown>> {
  const [{ totalMeetings }] = await db
    .select({ totalMeetings: sql<number>`count(*)::int` })
    .from(schema.meetings)
    .where(eq(schema.meetings.tenantId, tenantId));
  const [{ activeSeq }] = await db
    .select({ activeSeq: sql<number>`count(*)::int` })
    .from(schema.leads)
    .where(and(eq(schema.leads.tenantId, tenantId), eq(schema.leads.sequenceStatus, "active")));
  const recentRuns = await db
    .select({ runId: schema.crewRuns.runId, status: schema.crewRuns.status })
    .from(schema.crewRuns)
    .where(eq(schema.crewRuns.tenantId, tenantId))
    .orderBy(desc(schema.crewRuns.startedAt))
    .limit(5);

  return {
    total_meetings: totalMeetings,
    active_sequences: activeSeq,
    recent_runs: recentRuns,
  };
}
