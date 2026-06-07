/**
 * POST /api/leads/import — CSV lead import (tenant-scoped, auth'lu).
 * Body: { csv: string, segment?: string }. Email bazında upsert (tenant+email uniq).
 */
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { withTenant } from "@/lib/api/withTenant";
import { parseCsv, rowsToLeads } from "@/lib/leads/csv-import";

export const runtime = "nodejs";

export const POST = withTenant(async ({ req, tenant }) => {
  const body = (await req.json().catch(() => ({}))) as { csv?: string; segment?: string };
  if (!body.csv) {
    return NextResponse.json({ error: "csv alanı gerekli" }, { status: 400 });
  }

  const leads = rowsToLeads(parseCsv(body.csv), body.segment);
  if (leads.length === 0) {
    return NextResponse.json({ imported: 0, reason: "geçerli satır yok" });
  }

  let imported = 0;
  for (const l of leads) {
    await db
      .insert(schema.leads)
      .values({
        tenantId: tenant.id,
        firstName: l.firstName,
        lastName: l.lastName,
        email: l.email,
        company: l.company,
        phone: l.phone,
        industry: l.industry,
        city: l.city,
        country: l.country,
        linkedin: l.linkedin,
        targetSegment: l.targetSegment,
        source: "apollo_csv",
        status: "new",
        sequenceStatus: "active",
        nextFollowupAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [schema.leads.tenantId, schema.leads.email],
        // leads_tenant_email_uniq kısmi index (WHERE email IS NOT NULL) ile eşleşmeli.
        targetWhere: sql`${schema.leads.email} IS NOT NULL`,
        set: { company: l.company, industry: l.industry, updatedAt: new Date() },
      });
    imported += 1;
  }

  return NextResponse.json({ imported, tenant: tenant.slug });
});
