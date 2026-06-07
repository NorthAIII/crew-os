/**
 * Next.js-farkında auth yardımcıları (App Router, server-side).
 * Saf crypto session.ts'te; burada cookie okuma/yazma + guard mantığı.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./session.js";

export { SESSION_COOKIE, verifyPassword } from "./session.js";
export type { SessionPayload } from "./session.js";

/** Paylaşılan-parola login'inde tek admin oturumu. Faz: gerçek kullanıcı/rol. */
export const DEFAULT_SUBJECT = "kiwi-admin";

const isProd = process.env.NODE_ENV === "production";

/** Başarılı login sonrası imzalı oturum cookie'sini set eder. */
export async function setSessionCookie(sub: string = DEFAULT_SUBJECT): Promise<void> {
  const token = createSessionToken(sub);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

/** Logout — cookie'yi siler. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Geçerli oturumu döndürür (yoksa null). API route'larda kullanılır. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Sayfa (server component) guard'ı: oturum yoksa /login'e yönlendirir.
 * Geçerliyse payload döner.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
