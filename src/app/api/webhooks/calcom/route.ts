/**
 * POST /api/webhooks/calcom — Cal.com booking webhook.
 * Auth: paylaşılan secret (CALCOM_WEBHOOK_SECRET) — dashboard cookie değil (dış servis çağırır).
 * Tek-tenant: DEFAULT_TENANT_SLUG. (Multi-tenant'ta path/secret→tenant eşlemesi eklenecek.)
 */
import { NextResponse, type NextRequest } from "next/server";
import { resolveTenant } from "@/lib/tenant";
import { handleCalcomBooking, parseCalcomPayload } from "@/lib/webhooks/calcom";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (secret) {
    const provided = req.headers.get("x-webhook-secret") ?? new URL(req.url).searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[calcom] CALCOM_WEBHOOK_SECRET tanımlı değil — webhook doğrulaması atlandı (dev).");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const tenant = await resolveTenant();
  const parsed = parseCalcomPayload(body);
  const result = await handleCalcomBooking(tenant, parsed);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
