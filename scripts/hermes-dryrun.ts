/**
 * Faz 2 dry-run entegrasyon doğrulaması — gerçek lokal Postgres + MockTransport.
 * Canlı Gmail OLMADAN tüm Hermes akışını uçtan uca çalıştırır ve assert eder.
 *
 * Çalıştır: `npm run hermes:dryrun`
 * Kendi geçici test verisini kurar (TEST_EMAIL) ve sonunda TEMİZLER → prod seed kirlenmez.
 */
import assert from "node:assert/strict";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { resolveTenant, clearTenantCache } from "@/lib/tenant";
import { runSequenceSender } from "@/lib/hermes/sequence-sender";
import { handleReply } from "@/lib/hermes/reply-handler";
import { MockTransport } from "@/lib/hermes/gmail";

const TEST_EMAIL = "dryrun-lead@example.test";

async function cleanup(tenantId: string): Promise<void> {
  // Test leadin email'lerini, suppression'ını ve leadi sil.
  const leadRows = await db
    .select({ id: schema.leads.id })
    .from(schema.leads)
    .where(and(eq(schema.leads.tenantId, tenantId), eq(schema.leads.email, TEST_EMAIL)));
  for (const { id } of leadRows) {
    await db.delete(schema.hermesEmails).where(eq(schema.hermesEmails.leadId, id));
  }
  await db
    .delete(schema.emailSuppression)
    .where(and(eq(schema.emailSuppression.tenantId, tenantId), eq(schema.emailSuppression.email, TEST_EMAIL)));
  await db
    .delete(schema.leads)
    .where(and(eq(schema.leads.tenantId, tenantId), eq(schema.leads.email, TEST_EMAIL)));
  // Test şablonlarını sil.
  await db
    .delete(schema.hermesTemplates)
    .where(and(eq(schema.hermesTemplates.tenantId, tenantId), eq(schema.hermesTemplates.segment, "all")));
}

async function main(): Promise<void> {
  clearTenantCache();
  const tenant = await resolveTenant("kiwi");
  const now = new Date();
  const past = new Date(now.getTime() - 60_000);

  await cleanup(tenant.id);

  // --- Kurulum: hermes aç, şablon + test lead ekle ---
  await db
    .update(schema.hermesSettings)
    .set({ enabled: true, dailyCap: 20, maxSteps: 3, stepIntervalDays: 4 })
    .where(eq(schema.hermesSettings.tenantId, tenant.id));

  await db.insert(schema.hermesTemplates).values([
    { tenantId: tenant.id, segment: "all", step: 0, subject: "{{firmName}} için kısa bir fikir", body: "Merhaba {{firstName}},\n\n{{city}} bölgesinde {{firmName}} için bir fikrimiz var.\nGörüşelim mi? {{calLink}}", active: true },
    { tenantId: tenant.id, segment: "all", step: 1, subject: "Takip — {{firmName}}", body: "Merhaba {{firstName}}, geçen mailime dönebildiniz mi?", active: true },
  ]);

  const [lead] = await db
    .insert(schema.leads)
    .values({
      tenantId: tenant.id,
      firstName: "Ada",
      company: "Acme Studio",
      email: TEST_EMAIL,
      city: "Vancouver",
      targetSegment: null,
      status: "new",
      sequenceStep: 0,
      sequenceStatus: "active",
      nextFollowupAt: past,
    })
    .returning();

  // --- 1) Sequence-sender (MockTransport) ---
  const mock = new MockTransport();
  const res = await runSequenceSender("kiwi", { transport: mock, now });
  assert.equal(res.sent, 1, "1 e-posta gönderilmeli");
  assert.equal(mock.outbox.length, 1, "MockTransport outbox 1 olmalı");
  assert.equal(mock.outbox[0].to, TEST_EMAIL);
  assert.match(mock.outbox[0].subject, /Acme Studio için kısa bir fikir/, "şablon doldurulmuş subject");
  assert.match(mock.outbox[0].body, /Merhaba Ada/, "şablon doldurulmuş body");
  assert.match(mock.outbox[0].body, new RegExp(tenant.config.calLink!.replace(/[/.]/g, "\\$&")), "calLink config'ten");
  console.log("✓ sequence-sender: 1 mail (mock), şablon dolduruldu, calLink config'ten geldi");

  // --- 2) Lead ilerledi mi? ---
  const advanced = await db.query.leads.findFirst({ where: eq(schema.leads.id, lead.id) });
  assert.equal(advanced?.sequenceStep, 1, "step 0→1");
  assert.equal(advanced?.sequenceStatus, "active", "henüz aktif");
  assert.equal(advanced?.status, "contacted", "new→contacted");
  assert.ok(advanced?.nextFollowupAt && advanced.nextFollowupAt > now, "next followup ileri tarihli");
  console.log("✓ lead ilerletme: step=1, status=contacted, next_followup +4 gün");

  // --- 3) hermes_emails 'out' kaydı ---
  const [{ outCount }] = await db
    .select({ outCount: sql<number>`count(*)::int` })
    .from(schema.hermesEmails)
    .where(and(eq(schema.hermesEmails.leadId, lead.id), eq(schema.hermesEmails.direction, "out")));
  assert.equal(outCount, 1, "1 adet direction=out kaydı");
  console.log("✓ hermes_emails: direction='out' kaydı yazıldı");

  // --- 4) Gate: ikinci çalıştırma aynı leadi tekrar göndermez (nextFollowupAt ileride) ---
  const mock2 = new MockTransport();
  const res2 = await runSequenceSender("kiwi", { transport: mock2, now });
  assert.equal(res2.sent, 0, "tekrar gönderim olmamalı (followup ileride)");
  console.log("✓ idempotent: leadin followup'ı ileride → ikinci turda gönderim yok");

  // --- 5) Reply-handler: meeting_request → Cal.com linki gönderilir ---
  const mockReply = new MockTransport();
  const meet = await handleReply(
    { from: TEST_EMAIL, subject: "Re: fikir", body: "Görüşmek isterim, ne zaman uygun?", messageId: "<m1@mail>" },
    "kiwi",
    { transport: mockReply, classify: async () => ({ classification: "meeting_request", reason: "wants a call" }) },
  );
  assert.equal(meet.action, "meeting_link_sent");
  assert.equal(mockReply.outbox.length, 1, "Cal.com yanıtı gönderildi");
  assert.match(mockReply.outbox[0].body, new RegExp(tenant.config.calLink!.replace(/[/.]/g, "\\$&")), "yanıtta calLink");
  console.log("✓ reply meeting_request → Cal.com linki gönderildi");

  // --- 6) Reply-handler: negative → suppression + opt-out (keyword override, Haiku'suz) ---
  const neg = await handleReply(
    { from: TEST_EMAIL, subject: "Re: fikir", body: "lütfen beni listeden çıkar", messageId: "<m2@mail>" },
    "kiwi",
    { dryRun: true },
  );
  assert.equal(neg.classification, "negative", "keyword override → negative");
  assert.equal(neg.action, "suppressed");
  const supp = await db.query.emailSuppression.findFirst({
    where: and(eq(schema.emailSuppression.tenantId, tenant.id), eq(schema.emailSuppression.email, TEST_EMAIL)),
  });
  assert.ok(supp, "suppression kaydı var");
  const optedOut = await db.query.leads.findFirst({ where: eq(schema.leads.id, lead.id) });
  assert.equal(optedOut?.sequenceStatus, "opted_out", "lead opted_out");
  console.log("✓ reply negative (keyword) → suppression + lead opt-out");

  // --- 7) 'in' kayıtları yazıldı mı? ---
  const [{ inCount }] = await db
    .select({ inCount: sql<number>`count(*)::int` })
    .from(schema.hermesEmails)
    .where(and(eq(schema.hermesEmails.tenantId, tenant.id), eq(schema.hermesEmails.direction, "in")));
  assert.ok(inCount >= 2, "en az 2 direction='in' kaydı (meeting + negative)");
  console.log(`✓ hermes_emails: ${inCount} adet direction='in' yanıt kaydı`);

  await cleanup(tenant.id);
  // Ayarları güvenli varsayılana geri al (prod gibi).
  await db
    .update(schema.hermesSettings)
    .set({ enabled: false })
    .where(eq(schema.hermesSettings.tenantId, tenant.id));
  console.log("✓ temizlik tamam (test verisi silindi, hermes tekrar disabled)");
}

main()
  .then(() => {
    console.log("\nDRY-RUN BAŞARILI — tüm assert'ler geçti.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("DRY-RUN HATASI:", err);
    process.exit(1);
  });
