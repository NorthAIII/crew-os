/**
 * POST /api/agents/decisions/[id] — dashboard tek-tık onay/red.
 * Body: { decision: "approved" | "rejected" }. Onaylanırsa aksiyon dispatch edilir (OUTREACH→Hermes).
 * Yalnız bu tenant'ın 'pending' kararları üzerinde çalışır (tenant-scoped).
 */
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { withTenant } from "@/lib/api/withTenant";
import { dispatchAction } from "@/lib/agents/dispatch";

export const runtime = "nodejs";

export const POST = withTenant(async ({ req, tenant, params }) => {
  const id = params.id;
  const body = (await req.json().catch(() => ({}))) as { decision?: string };
  const decision = body.decision;
  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "decision 'approved' veya 'rejected' olmalı" }, { status: 400 });
  }

  const existing = await db.query.crewDecisions.findFirst({
    where: and(eq(schema.crewDecisions.id, id), eq(schema.crewDecisions.tenantId, tenant.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "karar bulunamadı" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return NextResponse.json({ error: `karar zaten '${existing.status}'` }, { status: 409 });
  }

  await db
    .update(schema.crewDecisions)
    .set({ status: decision, decidedBy: "dashboard-user", decidedAt: new Date() })
    .where(eq(schema.crewDecisions.id, id));

  let dispatch = null;
  if (decision === "approved") {
    dispatch = await dispatchAction(tenant, {
      id: 0,
      category: existing.actionType ?? "DIGER",
      description: existing.actionTitle ?? "",
    });
  }

  return NextResponse.json({ ok: true, id, decision, dispatch });
});
