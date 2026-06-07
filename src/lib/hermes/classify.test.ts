import assert from "node:assert/strict";
import { test } from "node:test";
import { keywordNegative, parseClassification } from "./classify.js";

test("keywordNegative — EN unsubscribe ifadeleri", () => {
  assert.equal(keywordNegative("please unsubscribe me"), true);
  assert.equal(keywordNegative("STOP EMAILING me now"), true);
  assert.equal(keywordNegative("take me off your list"), true);
});

test("keywordNegative — TR opt-out ifadeleri", () => {
  assert.equal(keywordNegative("Lütfen beni listeden çıkar"), true);
  assert.equal(keywordNegative("ilgilenmiyorum, teşekkürler"), true);
});

test("keywordNegative — DE abmelden", () => {
  assert.equal(keywordNegative("bitte abmelden"), true);
});

test("keywordNegative — pozitif/nötr metinde false", () => {
  assert.equal(keywordNegative("Bu harika, hadi görüşelim!"), false);
  assert.equal(keywordNegative(""), false);
});

test("parseClassification — geçerli JSON", () => {
  const r = parseClassification('Sure: {"classification": "meeting_request", "reason": "wants a call"}');
  assert.equal(r.classification, "meeting_request");
  assert.equal(r.reason, "wants a call");
});

test("parseClassification — geçersiz sınıf → not_relevant", () => {
  assert.equal(parseClassification('{"classification": "banana"}').classification, "not_relevant");
});

test("parseClassification — JSON yoksa → not_relevant/parse error", () => {
  const r = parseClassification("no json here");
  assert.equal(r.classification, "not_relevant");
  assert.equal(r.reason, "parse error");
});
