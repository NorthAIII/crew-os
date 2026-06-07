/**
 * Postgres bağlantısı (postgres.js + Drizzle). Tek havuz, process boyunca paylaşılır.
 * Hem Next.js (API route'lar) hem worker bu modülü kullanır.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL tanımlı değil — .env dosyasını kontrol et.");
}

// Next.js dev modunda HMR ile çoklu havuz açılmasını önle.
const globalForDb = globalThis as unknown as { _bunkerSql?: ReturnType<typeof postgres> };

const client = globalForDb._bunkerSql ?? postgres(connectionString, { max: 10, idle_timeout: 30 });
if (process.env.NODE_ENV !== "production") globalForDb._bunkerSql = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export { schema };
