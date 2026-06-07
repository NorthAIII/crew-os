import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv, rowsToLeads } from "./csv-import.js";

const CSV = `First Name,Last Name,Email,Company,City,Industry
Ada,Lovelace,ada@acme.com,"Acme, Inc",Vancouver,Software
Bob,,bob@beta.io,Beta,Kelowna,Retail
,,,,,`;

test("parseCsv tırnak içi virgülü korur", () => {
  const rows = parseCsv(CSV);
  assert.equal(rows.length, 3);
  assert.equal(rows[0]["company"], "Acme, Inc");
  assert.equal(rows[0]["email"], "ada@acme.com");
});

test("rowsToLeads email'siz satırı atar + alan eşler", () => {
  const leads = rowsToLeads(parseCsv(CSV));
  assert.equal(leads.length, 2); // 3. satır email'siz → atlandı
  assert.equal(leads[0].firstName, "Ada");
  assert.equal(leads[0].company, "Acme, Inc");
  assert.equal(leads[0].city, "Vancouver");
  assert.equal(leads[1].email, "bob@beta.io");
});

test("rowsToLeads default segment uygular", () => {
  const leads = rowsToLeads(parseCsv(CSV), "beauty-bc");
  assert.equal(leads[0].targetSegment, "beauty-bc");
});

test("rowsToLeads email'i küçük harfe çevirir", () => {
  const leads = rowsToLeads(parseCsv("Email\nADA@ACME.COM"));
  assert.equal(leads[0].email, "ada@acme.com");
});
