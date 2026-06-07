/**
 * Cal.com webhook — booking → lead/meeting (eski calcom-webhook.json portu).
 * Parser saf (test edilebilir); handler tenant-scoped lead+meeting upsert yapar.
 */
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ResolvedTenant } from "@/lib/tenant";
import { notifySlack } from "@/lib/notify/slack";
import type { ParsedBooking } from "./calcom-parse.js";

export { parseCalcomPayload } from "./calcom-parse.js";
export type { ParsedBooking, CalcomEvent } from "./calcom-parse.js";

export interface CalcomResult {
  ok: boolean;
  action: "created" | "rescheduled" | "cancelled" | "skipped";
  leadId?: string;
  meetingId?: string;
  reason?: string;
}

export async function handleCalcomBooking(
  tenant: ResolvedTenant,
  parsed: ParsedBooking,
): Promise<CalcomResult> {
  if (!parsed.email) return { ok: false, action: "skipped", reason: "no_email" };

  const scheduledAt = parsed.startTime ? new Date(parsed.startTime) : null;

  // İptal: ilgili meeting'i cancelled yap.
  if (parsed.event === "BOOKING_CANCELLED") {
    if (parsed.bookingUid) {
      await db
        .update(schema.meetings)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(schema.meetings.tenantId, tenant.id),
            eq(schema.meetings.calcomBookingId, parsed.bookingUid),
          ),
        );
    }
    await notifySlack(tenant.config.slackChannel, `:x: *Toplantı iptal* — ${parsed.email}`);
    return { ok: true, action: "cancelled" };
  }

  // Lead upsert (tenant + email).
  const existing = await db.query.leads.findFirst({
    where: and(eq(schema.leads.tenantId, tenant.id), sql`lower(${schema.leads.email}) = lower(${parsed.email})`),
  });

  let leadId: string;
  if (existing) {
    leadId = existing.id;
    await db
      .update(schema.leads)
      .set({ status: "meeting_booked", updatedAt: new Date() })
      .where(eq(schema.leads.id, existing.id));
  } else {
    const [created] = await db
      .insert(schema.leads)
      .values({
        tenantId: tenant.id,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        source: "cal_direct",
        status: "meeting_booked",
      })
      .returning({ id: schema.leads.id });
    leadId = created.id;
  }

  // Meeting upsert (booking uid idempotent).
  const [meeting] = await db
    .insert(schema.meetings)
    .values({
      tenantId: tenant.id,
      leadId,
      calcomBookingId: parsed.bookingUid || null,
      scheduledAt,
      status: "scheduled",
      notes: parsed.eventTitle,
    })
    .onConflictDoUpdate({
      target: [schema.meetings.tenantId, schema.meetings.calcomBookingId],
      // Kısmi unique index predicate'i (WHERE calcom_booking_id IS NOT NULL) ile eşleşmeli.
      targetWhere: sql`${schema.meetings.calcomBookingId} IS NOT NULL`,
      set: { status: "scheduled", scheduledAt, leadId },
    })
    .returning({ id: schema.meetings.id });

  await db.insert(schema.agentExecutions).values({
    tenantId: tenant.id,
    agentName: "calcom_webhook",
    leadId,
    status: "success",
    inputData: { ...parsed },
    outputData: { meetingId: meeting?.id, action: parsed.event },
  });

  await notifySlack(
    tenant.config.slackChannel,
    `:calendar: *Yeni toplantı!* ${parsed.firstName} (${parsed.email}) — ${parsed.eventTitle}${scheduledAt ? ` @ ${scheduledAt.toISOString()}` : ""}`,
  );

  return {
    ok: true,
    action: parsed.event === "BOOKING_RESCHEDULED" ? "rescheduled" : "created",
    leadId,
    meetingId: meeting?.id,
  };
}
