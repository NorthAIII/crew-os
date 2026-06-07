/**
 * Tenant-scoped API tabanı — TÜM /api/* route'ları bundan geçer.
 *
 * Garantiler:
 *  1. AUTH: geçerli oturum cookie'si yoksa 401 (auth'suz açık endpoint YOK — eski sistemin
 *     en büyük güvenlik açığı buydu).
 *  2. TENANT SCOPE: handler her zaman çözülmüş bir tenant alır; sorgular tenant.id ile
 *     filtrelenmelidir. Multi-tenant'a kadar slug DEFAULT_TENANT_SLUG'tan gelir, ama
 *     ileride header/subdomain'den gelecek şekilde tek noktadan değişir.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveTenant, type ResolvedTenant } from "@/lib/tenant";
import type { SessionPayload } from "@/lib/auth/session";

export interface TenantContext {
  req: NextRequest;
  tenant: ResolvedTenant;
  session: SessionPayload;
  params: Record<string, string>;
}

type Handler = (ctx: TenantContext) => Promise<NextResponse> | NextResponse;

/**
 * Route handler'ı auth + tenant guard ile sarmalar.
 * Kullanım: `export const GET = withTenant(async ({ tenant }) => { ... })`
 */
export function withTenant(handler: Handler) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let tenant: ResolvedTenant;
    try {
      // Multi-tenant'a kadar tek tenant; çözüm noktası burada izole.
      tenant = await resolveTenant();
    } catch (err) {
      return NextResponse.json(
        { error: "tenant_resolution_failed", detail: (err as Error).message },
        { status: 500 },
      );
    }

    const params = ctx?.params ? await ctx.params : {};
    return handler({ req, tenant, session, params });
  };
}
