/**
 * GET /api/leads — tenant-scoped lead listesi.
 * withTenant garantisi: auth'suz 401; sorgu DAİMA tenant.id ile filtreli.
 */
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { withTenant } from "@/lib/api/withTenant";

export const runtime = "nodejs";

export const GET = withTenant(async ({ tenant }) => {
  const rows = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.tenantId, tenant.id))
    .orderBy(desc(schema.leads.createdAt))
    .limit(100);

  return NextResponse.json({ tenant: tenant.slug, count: rows.length, leads: rows });
});
