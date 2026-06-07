/**
 * Korumalı Overview (placeholder). requireAuth() oturum yoksa /login'e yönlendirir.
 * Tenant profili tenant_config'ten okunur — hiçbir kiwi değeri burada sabit değil.
 */
import { requireAuth } from "@/lib/auth";
import { resolveTenant, buildTenantProfile } from "@/lib/tenant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  await requireAuth();
  const tenant = await resolveTenant();

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 32 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22 }}>{tenant.config.brandName} — Bunker OS</h1>
        <span style={{ fontSize: 12, color: "#8a95a5" }}>tenant: {tenant.slug}</span>
      </header>

      <section
        style={{
          background: "#11161f",
          border: "1px solid #1e2733",
          borderRadius: 12,
          padding: 20,
          marginTop: 16,
        }}
      >
        <h2 style={{ fontSize: 14, color: "#8a95a5", marginTop: 0 }}>Tenant profili (prompt'a enjekte)</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          {buildTenantProfile(tenant)}
        </pre>
      </section>

      <p style={{ color: "#8a95a5", fontSize: 13, marginTop: 24 }}>
        Faz 1 iskeleti. Leads / Hermes / Activity ekranları sonraki fazlarda.
      </p>
    </main>
  );
}
