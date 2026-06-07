/**
 * KB araması — Qdrant yerine Postgres full-text (kb_chunks, GIN tsvector).
 * 'simple' config çok-dilli güvenli (TR/EN). pgvector'a büyüme yolu açık.
 */
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { toOrTsquery } from "./kb-text.js";

export { chunkMarkdown, toOrTsquery } from "./kb-text.js";

export interface KbHit {
  document: string;
  text: string;
  score: number;
}

/** Tek sorgu için en alakalı chunk'lar (OR tsquery + ts_rank). */
export async function searchKb(tenantId: string, query: string, limit = 3): Promise<KbHit[]> {
  const tsq = toOrTsquery(query);
  if (!tsq) return [];
  const rows = await db.execute<{ document: string; text: string; score: number }>(sql`
    SELECT document, text,
           ts_rank(to_tsvector('simple', text), to_tsquery('simple', ${tsq})) AS score
    FROM kb_chunks
    WHERE tenant_id = ${tenantId}
      AND to_tsvector('simple', text) @@ to_tsquery('simple', ${tsq})
    ORDER BY score DESC
    LIMIT ${limit}
  `);
  return rows.map((r) => ({ document: r.document, text: r.text, score: Number(r.score) }));
}

/** Çoklu sorgu — sonuçları birleştirir, document+text bazında tekilleştirir. */
export async function searchKbMulti(
  tenantId: string,
  queries: string[],
  limitPerQuery = 2,
): Promise<KbHit[]> {
  const seen = new Set<string>();
  const out: KbHit[] = [];
  for (const q of queries) {
    const hits = await searchKb(tenantId, q, limitPerQuery);
    for (const h of hits) {
      const key = `${h.document}::${h.text.slice(0, 40)}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(h);
      }
    }
  }
  return out;
}
