/**
 * Hermes — sekans gönderici (eski hermes-sequence-sender.json'un koddaki portu).
 *
 * Akış:
 *  1. hermes_settings → enabled + dailyCap + maxSteps + stepIntervalDays
 *  2. Gate: kapalıysa veya günlük kap dolduysa çık → kalan kota
 *  3. sequence_status='active' AND next_followup_at<=now leadleri çek (kalan kota kadar)
 *  4. (segment, step) şablonu seç + doldur (calLink tenant_config'ten)
 *  5. Gmail ile gönder → hermes_emails (direction='out') yaz → leadi ilerlet
 *
 * Tüm kiwi-sabitleri tenant_config/env'den; canlı Gmail olmadan dryRun ile test edilir.
 */
import { and, eq, inArray, isNull, lte, notInArray, or, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { resolveTenant } from "@/lib/tenant";
import { createTransport, type EmailTransport } from "./gmail.js";
import { fillTemplate, selectTemplate, type TemplateRow } from "./templates.js";
import { computeLeadAdvance } from "./policy.js";
import { notifySlack } from "@/lib/notify/slack";

export interface SequenceResult {
  sent: number;
  skipped: number;
  reason?: string;
  transport: "gmail" | "mock";
}

const TERMINAL_LEAD_STATUSES = ["opted_out", "meeting_booked"];

export async function runSequenceSender(
  slug?: string,
  opts: { dryRun?: boolean; transport?: EmailTransport; now?: Date } = {},
): Promise<SequenceResult> {
  const now = opts.now ?? new Date();
  const tenant = await resolveTenant(slug);
  const transport = opts.transport ?? createTransport({ dryRun: opts.dryRun });

  // 1) Ayarlar
  const settings = await db.query.hermesSettings.findFirst({
    where: eq(schema.hermesSettings.tenantId, tenant.id),
  });
  if (!settings || !settings.enabled) {
    return { sent: 0, skipped: 0, reason: "disabled", transport: transport.kind };
  }

  // 2) Gate — günlük kap
  const [{ count: sentToday }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.hermesEmails)
    .where(
      and(
        eq(schema.hermesEmails.tenantId, tenant.id),
        eq(schema.hermesEmails.direction, "out"),
        sql`${schema.hermesEmails.sentAt}::date = ${now.toISOString()}::date`,
      ),
    );
  const remaining = settings.dailyCap - sentToday;
  if (remaining <= 0) {
    return { sent: 0, skipped: 0, reason: `daily_cap_reached(${sentToday}/${settings.dailyCap})`, transport: transport.kind };
  }

  // 3) Hazır leadler — segment config'ten; status terminalde değil; email var
  const segments = tenant.config.segments ?? [];
  const segmentFilter =
    segments.length > 0
      ? or(inArray(schema.leads.targetSegment, segments), isNull(schema.leads.targetSegment))
      : isNull(schema.leads.targetSegment);

  const ready = await db
    .select()
    .from(schema.leads)
    .where(
      and(
        eq(schema.leads.tenantId, tenant.id),
        eq(schema.leads.sequenceStatus, "active"),
        lte(schema.leads.nextFollowupAt, now),
        notInArray(schema.leads.status, TERMINAL_LEAD_STATUSES),
        sql`${schema.leads.email} IS NOT NULL AND ${schema.leads.email} <> ''`,
        segmentFilter,
      ),
    )
    .orderBy(schema.leads.nextFollowupAt)
    .limit(remaining);

  if (ready.length === 0) {
    return { sent: 0, skipped: 0, reason: "no_ready_leads", transport: transport.kind };
  }

  // 4) Aktif şablonlar
  const tplRows = await db.query.hermesTemplates.findMany({
    where: and(eq(schema.hermesTemplates.tenantId, tenant.id), eq(schema.hermesTemplates.active, true)),
  });
  const templates: TemplateRow[] = tplRows.map((t) => ({
    segment: t.segment,
    step: t.step,
    subject: t.subject,
    body: t.body,
  }));

  const calLink = tenant.config.calLink ?? tenant.config.websiteUrl ?? "";
  let sent = 0;
  let skipped = 0;

  for (const lead of ready) {
    const step = lead.sequenceStep ?? 0;
    const segment = lead.targetSegment ?? "all";
    const tpl = selectTemplate(templates, segment, step);
    if (!tpl) {
      skipped += 1;
      continue;
    }

    const vars = {
      firstName: lead.firstName ?? "",
      firmName: lead.company ?? "your firm",
      city: lead.city ?? "your city",
      calLink,
      segment: lead.targetSegment ?? "",
    };
    const subject = fillTemplate(tpl.subject, vars);
    const body = fillTemplate(tpl.body, vars);

    const result = await transport.send({
      to: lead.email!,
      cc: tenant.config.ccEmail ?? undefined,
      subject,
      body,
    });

    // 5a) hermes_emails kaydı (direction='out')
    await db.insert(schema.hermesEmails).values({
      tenantId: tenant.id,
      leadId: lead.id,
      direction: "out",
      messageId: result.messageId,
      subject,
      body,
      step,
      sentAt: now,
    });

    // 5b) Leadi ilerlet
    const adv = computeLeadAdvance(step, settings.maxSteps, settings.stepIntervalDays, now);
    await db
      .update(schema.leads)
      .set({
        sequenceStep: adv.nextStep,
        sequenceStatus: adv.sequenceStatus,
        nextFollowupAt: adv.nextFollowupAt,
        status: lead.status === "new" ? "contacted" : lead.status,
        lastContactAt: now,
        updatedAt: now,
      })
      .where(and(eq(schema.leads.id, lead.id), eq(schema.leads.tenantId, tenant.id)));

    sent += 1;
  }

  if (sent > 0) {
    await notifySlack(
      tenant.config.slackChannel,
      `:outbox_tray: *Hermes* — ${sent} e-posta gönderildi (${transport.kind}), ${skipped} atlandı. Tenant: ${tenant.slug}`,
    );
  }

  return { sent, skipped, transport: transport.kind };
}
