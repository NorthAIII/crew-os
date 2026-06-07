/**
 * Auth session crypto birim testleri — `npm test`.
 * node:test (yerleşik, ek bağımlılık yok). Saf fonksiyonlar; DB/Next gerektirmez.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createSessionToken,
  verifySessionToken,
  verifyPassword,
  SESSION_MAX_AGE_S,
} from "./session.js";

// Testler için sabit secret/parola.
process.env.AUTH_SECRET = "test_secret_at_least_16_chars_long";
process.env.AUTH_PASSWORD = "correct-horse";

test("geçerli token üretilir ve doğrulanır", () => {
  const now = 1_000_000;
  const token = createSessionToken("kiwi-admin", now);
  const payload = verifySessionToken(token, now);
  assert.ok(payload);
  assert.equal(payload?.sub, "kiwi-admin");
  assert.equal(payload?.exp, now + SESSION_MAX_AGE_S);
});

test("süresi dolmuş token reddedilir", () => {
  const iat = 1_000_000;
  const token = createSessionToken("kiwi-admin", iat);
  const later = iat + SESSION_MAX_AGE_S + 1;
  assert.equal(verifySessionToken(token, later), null);
});

test("imzası bozulmuş token reddedilir", () => {
  const token = createSessionToken("kiwi-admin", 1_000_000);
  const tampered = token.slice(0, -2) + (token.endsWith("a") ? "bb" : "aa");
  assert.equal(verifySessionToken(tampered, 1_000_000), null);
});

test("farklı secret ile imzalı token reddedilir", () => {
  const token = createSessionToken("kiwi-admin", 1_000_000);
  const original = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "different_secret_16_chars_min!!";
  const result = verifySessionToken(token, 1_000_000);
  process.env.AUTH_SECRET = original;
  assert.equal(result, null);
});

test("boş/null token reddedilir", () => {
  assert.equal(verifySessionToken(undefined, 1_000_000), null);
  assert.equal(verifySessionToken("", 1_000_000), null);
  assert.equal(verifySessionToken("garbage", 1_000_000), null);
});

test("doğru parola kabul, yanlış parola red", () => {
  assert.equal(verifyPassword("correct-horse"), true);
  assert.equal(verifyPassword("wrong"), false);
  assert.equal(verifyPassword(""), false);
  assert.equal(verifyPassword(undefined), false);
});
