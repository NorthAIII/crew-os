/**
 * Hermes — yanıt işleyici (eski hermes-reply-handler.json'un koddaki portu).
 *
 * Akış: kendi mailini atla → Haiku ile sınıfla (+ TR/EN/DE keyword override) →
 * yanıtı kaydet (direction='in') → route:
 *   meeting_request → Cal.com linki gönder + Slack
 *   positive        → Slack bildir
 *   negative        → suppression + opt-out + Slack
 *   out_of_office / not_relevant → sadece kaydet
 *
 * calLink/sender/slackChannel tenant_config'ten; LLM tek sağlayıcı Anthropic (Haiku).
 */
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { resolveTenant } from "@/lib/tenant";
import { complete } from "@/lib/llm/client";
import { createTransport, type EmailTransport } from "./gmail.js";
import { notifySlack } from "@/lib/notify/slack";
import {
  CLASSIFY_SYSTEM,
  keywordNegative,
  parseClassification,
  type Classification,
  type ClassifyResult,
} from "./classify.js";

export type { Classification, ClassifyResult } from "./classify.js";
export { keywordNegative, parseClassification } from "./classify.js";

export interface InboundEmail {
  from: string; // gönderen e-posta adresi
  subject: string;
  body: string;
  messageId?: string;
  threadId?: string;
}

/** Haiku ile sınıflandır (keyword override önce). Testte opts.classify ile bypass edilir. */
export async function classifyReply(email: InboundEmail): Promise<ClassifyResult> {
  if (keywordNegative(email.body)) {
    return { classification: "negative", reason: "keyword override (opt-out)" };
  }
  const res = await complete({
    tier: "haiku",
    system: CLASSIFY_SYSTEM,
    maxTokens: 150,
    temperature: 0,
    user: `From: ${email.from}\nSubject: ${email.subject}\nBody: ${email.body.slice(0, 600)}`,
  });
  const parsed = parseClassification(res.text);
  // Modelin kaçırma ihtimaline karşı keyword override'ı sonuçta da uygula.
  if (keywordNegative(email.body)) return { classification: "negative", reason: "keyword override" };
  return parsed;
}

export interface ReplyResult {
  classification: Classification;
  action: "meeting_link_sent" | "notified" | "suppressed" | "recorded" | "skipped_self";
  leadId?: string;
}

export async function handleReply(
  inbound: InboundEmail,
  slug?: string,
  opts: {
    transport?: EmailTransport;
    dryRun?: boolean;
    classify?: (email: InboundEmail) => Promise<ClassifyResult>;
    now?: Date;
  } = {},
): Promise<ReplyResult> {
  const now = opts.now ?? new Date();
  const tenant = await resolveTenant(slug);
  const transport = opts.transport ?? createTransport({ dryRun: opts.dryRun });

  // 0) Kendi gönderimimizi atla
  const senderEmail = (tenant.config.senderEmail ?? process.env.GMAIL_SENDER ?? "").toLowerCase();
  if (senderEmail && inbound.from.toLowerCase().includes(senderEmail)) {
    return { classification: "not_relevant", action: "skipped_self" };
  }

  // 1) Sınıflandır
  const { classification, reason } = opts.classify
    ? await opts.classify(inbound)
    : await classifyReply(inbound);

  // 2) İlgili leadi bul (tenant + email)
  const lead = await db.query.leads.findFirst({
    where: and(
      eq(schema.leads.tenantId, tenant.id),
      sql`lower(${schema.leads.email}) = lower(${inbound.from})`,
    ),
  });

  // 3) Yanıtı kaydet (direction='in')
  await db.insert(schema.hermesEmails).values({
    tenantId: tenant.id,
    leadId: lead?.id ?? null,
    direction: "in",
    messageId: inbound.messageId,
    subject: inbound.subject,
    body: inbound.body,
    classification,
  });

  // 4) Route
  const fromEmail = inbound.from;
  if (classification === "meeting_request") {
    const calLink = tenant.config.calLink ?? "";
    await transport.send({
      to: fromEmail,
      subject: `Re: ${inbound.subject}`,
      body: `Merhaba,\n\nMemnuniyetle! Size uygun bir zaman seçin, görüşelim:\n${calLink}\n\n${tenant.config.senderName ?? ""}`,
      inReplyTo: inbound.messageId,
      threadId: inbound.threadId,
    });
    await notifySlack(
      tenant.config.slackChannel,
      `:calendar: *Hermes — Meeting Talebi!*\nKim: ${fromEmail}\nKonu: ${inbound.subject}\nSebep: ${reason}`,
    );
    return { classification, action: "meeting_link_sent", leadId: lead?.id };
  }

  if (classification === "positive") {
    await notifySlack(
      tenant.config.slackChannel,
      `:fire: *Hermes — Pozitif Yanıt!*\nKim: ${fromEmail}\nKonu: ${inbound.subject}\nSebep: ${reason}`,
    );
    return { classification, action: "notified", leadId: lead?.id };
  }

  if (classification === "negative") {
    // Suppression (tenant başına email uniq) + lead opt-out
    await db
      .insert(schema.emailSuppression)
      .values({ tenantId: tenant.id, email: fromEmail.toLowerCase(), reason: "negative_reply" })
      .onConflictDoNothing({
        target: [schema.emailSuppression.tenantId, schema.emailSuppression.email],
      });
    await db
      .update(schema.leads)
      .set({ status: "opted_out", sequenceStatus: "opted_out", updatedAt: now })
      .where(
        and(
          eq(schema.leads.tenantId, tenant.id),
          sql`lower(${schema.leads.email}) = lower(${fromEmail})`,
        ),
      );
    await notifySlack(
      tenant.config.slackChannel,
      `:no_entry: *Hermes — Opt-out (auto)*\nKim: ${fromEmail}\nSebep: ${reason}`,
    );
    return { classification, action: "suppressed", leadId: lead?.id };
  }

  // out_of_office / not_relevant → sadece kayıt
  return { classification, action: "recorded", leadId: lead?.id };
}
