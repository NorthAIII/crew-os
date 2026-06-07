/**
 * POST /api/auth/login — paylaşılan parola ile login.
 * Body: { password: string }. Doğruysa imzalı oturum cookie'si set edilir.
 */
import { NextResponse, type NextRequest } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let password: string | undefined;
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  await setSessionCookie();
  return NextResponse.json({ ok: true });
}
