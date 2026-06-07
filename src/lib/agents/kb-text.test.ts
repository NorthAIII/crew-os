import assert from "node:assert/strict";
import { test } from "node:test";
import { chunkMarkdown, toOrTsquery } from "./kb-text.js";

test("chunkMarkdown başlık ve --- sınırlarında böler", () => {
  const md = "# Başlık\n\nGiriş.\n\n---\n\n## Bölüm 1\nİçerik 1\n\n## Bölüm 2\nİçerik 2";
  const chunks = chunkMarkdown(md);
  assert.ok(chunks.length >= 3);
  assert.ok(chunks.some((c) => c.includes("Bölüm 1")));
  assert.ok(chunks.some((c) => c.includes("Bölüm 2")));
});

test("chunkMarkdown uzun bölümü maxLen'e göre böler", () => {
  const para = "x".repeat(400);
  const md = `## Uzun\n\n${para}\n\n${para}\n\n${para}`;
  const chunks = chunkMarkdown(md, 500);
  assert.ok(chunks.length >= 2, "uzun bölüm parçalanmalı");
  assert.ok(chunks.every((c) => c.length <= 900));
});

test("chunkMarkdown boş girdi → boş dizi", () => {
  assert.deepEqual(chunkMarkdown("   "), []);
});

test("toOrTsquery alfanümerik token'ları OR'lar", () => {
  assert.equal(toOrTsquery("fiyatlandırma retainer"), "fiyatlandırma | retainer");
  assert.equal(toOrTsquery("Discovery Call!"), "discovery | call");
});

test("toOrTsquery tek harfli/boş token'ları atar", () => {
  assert.equal(toOrTsquery("a bc d ef"), "bc | ef");
  assert.equal(toOrTsquery("   "), "");
});
