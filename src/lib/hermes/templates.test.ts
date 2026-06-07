import assert from "node:assert/strict";
import { test } from "node:test";
import { fillTemplate, selectTemplate, type TemplateRow } from "./templates.js";

const vars = {
  firstName: "Ada",
  firmName: "Acme",
  city: "Vancouver",
  calLink: "https://cal.com/x/discovery",
  segment: "beauty-bc",
};

test("fillTemplate tüm değişkenleri doldurur (boşluklu varyant dahil)", () => {
  const out = fillTemplate("Merhaba {{firstName}}, {{ firmName }} için {{city}} — {{calLink}} [{{segment}}]", vars);
  assert.equal(out, "Merhaba Ada, Acme için Vancouver — https://cal.com/x/discovery [beauty-bc]");
});

test("fillTemplate aynı değişkeni tekrar tekrar doldurur", () => {
  assert.equal(fillTemplate("{{firstName}} {{firstName}}", vars), "Ada Ada");
});

const TPL: TemplateRow[] = [
  { segment: "beauty-bc", step: 0, subject: "s-b0", body: "b-b0" },
  { segment: "all", step: 0, subject: "s-a0", body: "b-a0" },
  { segment: "all", step: 1, subject: "s-a1", body: "b-a1" },
];

test("selectTemplate tam eşleşmeyi tercih eder", () => {
  assert.equal(selectTemplate(TPL, "beauty-bc", 0)?.subject, "s-b0");
});

test("selectTemplate tam eşleşme yoksa 'all'e düşer", () => {
  assert.equal(selectTemplate(TPL, "ecommerce", 1)?.subject, "s-a1");
});

test("selectTemplate hiç eşleşme yoksa null", () => {
  assert.equal(selectTemplate(TPL, "ecommerce", 5), null);
});
