import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCalcomPayload } from "./calcom-parse.js";

test("parseCalcomPayload tam payload'ı çözer", () => {
  const p = parseCalcomPayload({
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: "abc123",
      startTime: "2026-06-01T10:00:00Z",
      title: "Discovery Call",
      attendees: [{ email: "Lead@Acme.com", name: "Ada Lovelace" }],
    },
  });
  assert.equal(p.event, "BOOKING_CREATED");
  assert.equal(p.email, "Lead@Acme.com");
  assert.equal(p.firstName, "Ada");
  assert.equal(p.lastName, "Lovelace");
  assert.equal(p.bookingUid, "abc123");
  assert.equal(p.eventTitle, "Discovery Call");
});

test("parseCalcomPayload alternatif alan adlarını tolere eder", () => {
  const p = parseCalcomPayload({ attendeeEmail: "x@y.com", attendeeName: "Tek", start: "2026-06-02T09:00:00Z" });
  assert.equal(p.email, "x@y.com");
  assert.equal(p.firstName, "Tek");
  assert.equal(p.lastName, "");
  assert.equal(p.startTime, "2026-06-02T09:00:00Z");
  assert.equal(p.eventTitle, "Discovery Call"); // varsayılan
});

test("parseCalcomPayload iptal eventini taşır", () => {
  const p = parseCalcomPayload({ triggerEvent: "BOOKING_CANCELLED", payload: { uid: "u1", attendees: [{ email: "a@b.com" }] } });
  assert.equal(p.event, "BOOKING_CANCELLED");
  assert.equal(p.bookingUid, "u1");
});

test("parseCalcomPayload boş girdide patlamaz", () => {
  const p = parseCalcomPayload(null);
  assert.equal(p.email, "");
  assert.equal(p.event, "BOOKING_CREATED");
});
