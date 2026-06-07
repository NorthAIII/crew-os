/**
 * Bunker OS v3 — tek kaynak veritabanı şeması (Drizzle / PostgreSQL).
 *
 * Tasarım ilkeleri (sistem analizi raporundan):
 *  - MULTI-TENANT gün-1: her iş tablosunda tenant_id (FK → tenants).
 *  - Tüm kiwi'ye-özel sabitler (marka, sender, cal.com, slack, segment, fiyat) koda
 *    GÖMÜLMEZ → tenant_config tablosunda yaşar (white-label için).
 *  - Vektör DB YOK: KB chunk'ları Postgres'te (kb_chunks), full-text ile aranır.
 *  - crew_memory + crew_os_lessons tek tabloda birleşti: crew_lessons.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Tenancy
// ---------------------------------------------------------------------------

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // örn. "kiwi"
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tenant başına yapılandırma — eski kodda PROMPT/SQL içine gömülü olan her şey.
 * Hermes sender, Cal.com linki, Slack kanalı, segment listesi, fiyat/maliyet vb.
 */
export const tenantConfig = pgTable("tenant_config", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  brandName: text("brand_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  senderName: text("sender_name").notNull(),
  calLink: text("cal_link"),
  slackChannel: text("slack_channel"),
  ccEmail: text("cc_email"),
  websiteUrl: text("website_url"),
  // Esnek alanlar — şema değişmeden büyüsün:
  segments: jsonb("segments").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  pricing: jsonb("pricing").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`),
  monthlyCostsUsd: numeric("monthly_costs_usd", { precision: 10, scale: 2 }),
  // Conductor/Scout prompt'larına enjekte edilecek serbest metin profil:
  businessContext: text("business_context"),
  targetMarkets: jsonb("target_markets").$type<string[]>().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Leads & meetings (pipeline çekirdeği)
// ---------------------------------------------------------------------------

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    source: text("source").default("manual"),
    status: text("status").notNull().default("new"),
    pipelineStage: text("pipeline_stage"),
    // v3 CRM alanları
    industry: text("industry"),
    country: text("country"),
    city: text("city"),
    linkedin: text("linkedin"),
    targetSegment: text("target_segment"),
    score: integer("score"),
    scoreReasoning: text("score_reasoning"),
    // v3 sequence alanları (Hermes)
    sequenceStep: integer("sequence_step").notNull().default(0),
    sequenceStatus: text("sequence_status").notNull().default("pending"), // pending|active|completed|opted_out
    nextFollowupAt: timestamp("next_followup_at", { withTimezone: true }),
    // Entegrasyon ID'leri
    hubspotContactId: text("hubspot_contact_id"),
    instantlyContactId: text("instantly_contact_id"),
    rawData: jsonb("raw_data").$type<Record<string, unknown>>(),
    tags: text("tags").array(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
  },
  (t) => [
    // (tenant_id, email) email doluyken benzersiz (eski Migration 0008 mantığı).
    uniqueIndex("leads_tenant_email_uniq")
      .on(t.tenantId, t.email)
      .where(sql`${t.email} IS NOT NULL`),
    index("leads_tenant_status_idx").on(t.tenantId, t.status),
    index("leads_followup_idx").on(t.sequenceStatus, t.nextFollowupAt),
  ],
);

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
    calcomBookingId: text("calcom_booking_id"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    durationMin: integer("duration_min"),
    meetingLink: text("meeting_link"),
    status: text("status").default("scheduled"),
    notes: text("notes"),
    hubspotDealId: text("hubspot_deal_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Cal.com booking idempotency (webhook upsert): booking id tenant başına benzersiz.
    uniqueIndex("meetings_calcom_uniq")
      .on(t.tenantId, t.calcomBookingId)
      .where(sql`${t.calcomBookingId} IS NOT NULL`),
  ],
);

// ---------------------------------------------------------------------------
// Hermes (outreach)
// ---------------------------------------------------------------------------

export const hermesSettings = pgTable("hermes_settings", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  dailyCap: integer("daily_cap").notNull().default(20),
  // Sekans politikası (eski sistemde prompt/SQL'e hardcode'tu: 3 adım / +4 gün) → tenant başına config.
  maxSteps: integer("max_steps").notNull().default(3),
  stepIntervalDays: integer("step_interval_days").notNull().default(4),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hermesTemplates = pgTable(
  "hermes_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    segment: text("segment").notNull(),
    step: integer("step").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("hermes_tpl_uniq").on(t.tenantId, t.segment, t.step)],
);

export const hermesEmails = pgTable(
  "hermes_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
    direction: text("direction").notNull(), // "out" | "in"
    messageId: text("message_id"),
    subject: text("subject"),
    body: text("body"),
    classification: text("classification"), // reply-handler sonucu
    step: integer("step"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("hermes_emails_lead_idx").on(t.tenantId, t.leadId)],
);

export const emailSuppression = pgTable(
  "email_suppression",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("suppression_uniq").on(t.tenantId, t.email)],
);

// ---------------------------------------------------------------------------
// Ajan çalışmaları & içerik kuyruğu
// ---------------------------------------------------------------------------

export const agentExecutions = pgTable("agent_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  agentName: text("agent_name").notNull(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  status: text("status").notNull().default("running"),
  inputData: jsonb("input_data").$type<Record<string, unknown>>(),
  outputData: jsonb("output_data").$type<Record<string, unknown>>(),
  errorMessage: text("error_message"),
  tokensUsed: integer("tokens_used"),
  costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
  latencyMs: integer("latency_ms"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const contentQueue = pgTable("content_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // linkedin|instagram|twitter
  content: text("content").notNull(),
  hashtags: text("hashtags").array(),
  status: text("status").notNull().default("draft"), // draft|approved|posted|rejected
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  postUrl: text("post_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Crew (AI COO beyni) — runs / decisions / lessons (Graduated Autonomy + Reflexion)
// ---------------------------------------------------------------------------

export const crewRuns = pgTable("crew_runs", {
  runId: text("run_id").primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending|running|completed|failed
  resultJson: jsonb("result_json").$type<Record<string, unknown>>(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const crewDecisions = pgTable("crew_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  runId: text("run_id"),
  actionTitle: text("action_title"),
  actionType: text("action_type"), // OUTREACH|EMAIL|ICERIK|CRM|ARASTIRMA|DIGER
  status: text("status").notNull(), // approved|rejected|auto_approved|auto_rejected
  decidedBy: text("decided_by"),
  decidedAt: timestamp("decided_at", { withTimezone: true }).notNull().defaultNow(),
});

export const crewLessons = pgTable("crew_lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  category: text("category"), // reflexion|pattern|autonomy
  content: text("content").notNull(),
  sourceRun: text("source_run"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// KB — Qdrant yerine Postgres full-text (küçük KB: ~5 doküman / ~43 chunk)
// ---------------------------------------------------------------------------

export const kbChunks = pgTable(
  "kb_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    document: text("document").notNull(),
    chunkIndex: integer("chunk_index").notNull().default(0),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Full-text arama için GIN index (ifade üzerinde). 'simple' config çok-dilli güvenli.
    index("kb_chunks_fts_idx").using("gin", sql`to_tsvector('simple', ${t.text})`),
    index("kb_chunks_tenant_idx").on(t.tenantId),
  ],
);

// Tip kısayolları (uygulama genelinde kullanım için)
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type TenantConfig = typeof tenantConfig.$inferSelect;
export type CrewRun = typeof crewRuns.$inferSelect;
