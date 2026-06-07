import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyActions,
  buildAutonomyContext,
  buildApprovalBlock,
} from "./autonomy.js";
import type { ApprovalRates, PendingAction } from "./types.js";

const rates: ApprovalRates = {
  OUTREACH: { total: 10, approved: 9, rejected: 1, approval_rate: 90 }, // auto-approve
  ICERIK: { total: 8, approved: 1, rejected: 7, approval_rate: 12 }, //  auto-reject
  CRM: { total: 5, approved: 3, rejected: 2, approval_rate: 60 }, //     mid → needs
  ARASTIRMA: { total: 2, approved: 2, rejected: 0, approval_rate: 100 }, // yüksek oran ama n<3 → needs
};

const actions: PendingAction[] = [
  { id: 1, category: "OUTREACH", description: "15 email" },
  { id: 2, category: "ICERIK", description: "blog" },
  { id: 3, category: "CRM", description: "temizlik" },
  { id: 4, category: "ARASTIRMA", description: "lead topla" },
  { id: 5, category: "DIGER", description: "bilinmeyen" }, // rates'te yok → needs
];

test("classifyActions eşikleri doğru uygular (oran + min sayı)", () => {
  const r = classifyActions(actions, rates);
  assert.deepEqual(r.autoApproved.map((a) => a.id), [1]);
  assert.deepEqual(r.autoRejected.map((a) => a.id), [2]);
  assert.deepEqual(r.needsApproval.map((a) => a.id).sort(), [3, 4, 5]);
});

test("classifyActions — min sayı yetersizse oran yüksek olsa da auto-approve YOK", () => {
  // ARASTIRMA %100 ama total=2 < 3 → needs
  const r = classifyActions([{ id: 4, category: "ARASTIRMA", description: "x" }], rates);
  assert.equal(r.autoApproved.length, 0);
  assert.equal(r.needsApproval.length, 1);
});

test("buildAutonomyContext yüksek/düşük/orta kovaları ayırır", () => {
  const ctx = buildAutonomyContext(rates);
  assert.match(ctx, /OTOMATIK ONAY.*OUTREACH/s);
  assert.match(ctx, /ÖNERME.*ICERIK/s);
  assert.match(ctx, /NORMAL ONAY.*(CRM|ARASTIRMA)/s);
});

test("buildAutonomyContext boş oranlarda veri-yok mesajı", () => {
  assert.match(buildAutonomyContext({}), /Henüz yeterli veri yok/);
});

test("buildApprovalBlock dashboard formatında listeler", () => {
  const block = buildApprovalBlock([{ id: 1, category: "OUTREACH", description: "15 email" }]);
  assert.match(block, /ONAY BEKLEYENLER \(dashboard/);
  assert.match(block, /\[1\] \[OUTREACH\] 15 email/);
  assert.equal(buildApprovalBlock([]), "");
});
