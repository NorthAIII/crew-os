import assert from "node:assert/strict";
import { test } from "node:test";
import { buildRawMessage, MockTransport } from "./gmail.js";

test("buildRawMessage geçerli base64url RFC822 üretir", () => {
  const raw = buildRawMessage("sender@example.com", {
    to: "lead@acme.com",
    cc: "cc@example.com",
    subject: "Merhaba",
    body: "Test gövdesi",
  });
  const decoded = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(decoded, /^From: sender@example\.com\r\n/);
  assert.match(decoded, /\r\nTo: lead@acme\.com\r\n/);
  assert.match(decoded, /\r\nCc: cc@example\.com\r\n/);
  assert.match(decoded, /\r\n\r\nTest gövdesi$/);
});

test("buildRawMessage UTF-8 konuyu RFC2047 ile kodlar", () => {
  const raw = buildRawMessage("a@b.com", { to: "c@d.com", subject: "Görüşelim mi?", body: "x" });
  const decoded = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(decoded, /Subject: =\?UTF-8\?B\?/);
});

test("buildRawMessage saf-ASCII konuyu kodlamadan bırakır", () => {
  const raw = buildRawMessage("a@b.com", { to: "c@d.com", subject: "Hello there", body: "x" });
  const decoded = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(decoded, /\r\nSubject: Hello there\r\n/);
});

test("buildRawMessage inReplyTo başlıklarını ekler", () => {
  const raw = buildRawMessage("a@b.com", {
    to: "c@d.com",
    subject: "Re: x",
    body: "x",
    inReplyTo: "<msg-123@mail>",
  });
  const decoded = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(decoded, /In-Reply-To: <msg-123@mail>/);
  assert.match(decoded, /References: <msg-123@mail>/);
});

test("MockTransport gönderimi belleğe kaydeder + messageId döner", async () => {
  const t = new MockTransport();
  const r1 = await t.send({ to: "a@x.com", subject: "s1", body: "b1" });
  const r2 = await t.send({ to: "b@x.com", subject: "s2", body: "b2" });
  assert.equal(t.kind, "mock");
  assert.equal(t.outbox.length, 2);
  assert.equal(t.outbox[0].to, "a@x.com");
  assert.notEqual(r1.messageId, r2.messageId);
});
