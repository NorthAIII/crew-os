import assert from "node:assert/strict";
import { test } from "node:test";
import { computeLeadAdvance } from "./policy.js";

const now = new Date("2026-05-31T00:00:00.000Z");

test("ortadaki adım: step artar, +interval gün, active kalır", () => {
  const r = computeLeadAdvance(0, 3, 4, now);
  assert.equal(r.nextStep, 1);
  assert.equal(r.sequenceStatus, "active");
  assert.equal(r.nextFollowupAt?.toISOString(), "2026-06-04T00:00:00.000Z");
});

test("son adıma ulaşınca: completed + nextFollowupAt null", () => {
  const r = computeLeadAdvance(2, 3, 4, now); // 2→3, maxSteps=3
  assert.equal(r.nextStep, 3);
  assert.equal(r.sequenceStatus, "completed");
  assert.equal(r.nextFollowupAt, null);
});

test("stepIntervalDays config'e saygı duyar", () => {
  const r = computeLeadAdvance(0, 5, 7, now);
  assert.equal(r.nextFollowupAt?.toISOString(), "2026-06-07T00:00:00.000Z");
  assert.equal(r.sequenceStatus, "active");
});
