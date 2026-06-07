/**
 * Ops günlük rapor (eski ops-monitoring / Ops Daily Report portu).
 * v3 metriklerini toplar → Türkçe özet → Slack. LLM gerektirmez (deterministik).
 */
import { resolveTenant, type ResolvedTenant } from "@/lib/tenant";
import { fetchLeadMetrics, fetchPipelineStats } from "./metrics.js";
import { notifySlack } from "@/lib/notify/slack";

export interface OpsReport {
  summary: string;
  metrics: Record<string, unknown>;
}

export async function runOpsReport(slug?: string, tenantArg?: ResolvedTenant): Promise<OpsReport> {
  const tenant = tenantArg ?? (await resolveTenant(slug));
  const [leads, pipeline] = await Promise.all([
    fetchLeadMetrics(tenant.id),
    fetchPipelineStats(tenant.id),
  ]);

  const summary = [
    `:bar_chart: *${tenant.config.brandName} — Günlük Ops Raporu*`,
    `• Toplam lead: ${leads.total_leads} (son 7g: +${leads.new_leads_7d})`,
    `• Gönderilen e-posta (7g): ${leads.outreach_emails_sent_7d} · Yanıt: ${leads.replies_7d}`,
    `• Toplantı (7g): ${leads.meetings_7d} · Aktif sekans: ${pipeline.active_sequences}`,
    `• Lead durumları: ${JSON.stringify(leads.leads_by_status)}`,
  ].join("\n");

  await notifySlack(tenant.config.slackChannel, summary);
  return { summary, metrics: { leads, pipeline } };
}
