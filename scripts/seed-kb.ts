/**
 * KB FTS seed — kiwi bilgi tabanı doc'larını chunk'layıp kb_chunks'a yazar (Qdrant yerine).
 * Kaynak: scripts/kb-seed/<slug>/*.md. Idempotent: doküman bazında sil+yeniden yaz.
 *
 * Çalıştır: `npm run db:seed:kb`
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { resolveTenant } from "@/lib/tenant";
import { chunkMarkdown } from "@/lib/agents/kb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SLUG = process.env.DEFAULT_TENANT_SLUG ?? "kiwi";

async function main(): Promise<void> {
  const tenant = await resolveTenant(SLUG);
  const dir = join(__dirname, "kb-seed", SLUG);
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));

  let totalChunks = 0;
  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf8");
    const chunks = chunkMarkdown(text);

    // Idempotent: bu dokümanın eski chunk'larını sil.
    await db
      .delete(schema.kbChunks)
      .where(and(eq(schema.kbChunks.tenantId, tenant.id), eq(schema.kbChunks.document, file)));

    if (chunks.length) {
      await db.insert(schema.kbChunks).values(
        chunks.map((text, i) => ({ tenantId: tenant.id, document: file, chunkIndex: i, text })),
      );
    }
    totalChunks += chunks.length;
    console.log(`  ${file}: ${chunks.length} chunk`);
  }

  console.log(`\n✓ KB seed tamam: ${files.length} doküman / ${totalChunks} chunk → kb_chunks (tenant=${SLUG})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("KB seed hatası:", err);
    process.exit(1);
  });
