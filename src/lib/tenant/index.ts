/**
 * Tenant çözümleme + yapılandırma yükleme.
 * Eski kodda prompt/SQL içine gömülü olan her kiwi-sabiti artık tenant_config'ten gelir.
 * Tek-tenant modunda DEFAULT_TENANT_SLUG (env) kullanılır; multi-tenant'a kadar köprü.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { TenantConfig } from "@/db/schema";

const DEFAULT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "kiwi";

export interface ResolvedTenant {
  id: string;
  slug: string;
  name: string;
  config: TenantConfig;
}

const cache = new Map<string, ResolvedTenant>();

export async function resolveTenant(slug: string = DEFAULT_SLUG): Promise<ResolvedTenant> {
  const cached = cache.get(slug);
  if (cached) return cached;

  const tenant = await db.query.tenants.findFirst({
    where: eq(schema.tenants.slug, slug),
  });
  if (!tenant) throw new Error(`Bilinmeyen tenant slug: ${slug}`);

  const config = await db.query.tenantConfig.findFirst({
    where: eq(schema.tenantConfig.tenantId, tenant.id),
  });
  if (!config) throw new Error(`tenant_config eksik: ${slug} (${tenant.id})`);

  const resolved: ResolvedTenant = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    config,
  };
  cache.set(slug, resolved);
  return resolved;
}

/** Test/seed sonrası cache'i temizle. */
export function clearTenantCache(): void {
  cache.clear();
}

/**
 * Conductor/Scout prompt'larına enjekte edilecek tenant profil metni.
 * Böylece "KiwiAI Lab / Kivanc / fiyatlar" hiçbir prompt'a gömülmez.
 */
export function buildTenantProfile(t: ResolvedTenant): string {
  const c = t.config;
  const lines = [
    `Şirket: ${c.brandName}`,
    c.businessContext ? `Bağlam: ${c.businessContext}` : null,
    c.targetMarkets?.length ? `Hedef pazarlar: ${c.targetMarkets.join(", ")}` : null,
    c.segments?.length ? `Segmentler: ${c.segments.join(", ")}` : null,
    c.monthlyCostsUsd ? `Aylık sabit maliyet: $${c.monthlyCostsUsd}` : null,
    c.calLink ? `Discovery call linki: ${c.calLink}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}
