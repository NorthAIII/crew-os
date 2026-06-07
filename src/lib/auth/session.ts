/**
 * Oturum imzalama/doğrulama — saf crypto, Next.js bağımlılığı YOK (birim test edilebilir).
 *
 * MVP auth: tek paylaşılan parola (AUTH_PASSWORD) + HMAC-imzalı stateless cookie.
 * Token = base64url(payload).base64url(hmacSHA256(payload, AUTH_SECRET))
 * Payload = JSON { sub, iat, exp } — sub şimdilik sabit "kiwi-admin" (Faz: gerçek kullanıcı/rol).
 *
 * İleride gerçek kullanıcı tablosu gelince sub=userId olur; imza şeması aynı kalır.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const ALG = "sha256";
export const SESSION_COOKIE = "bunker_session";
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 gün

export interface SessionPayload {
  sub: string;
  iat: number; // saniye (unix)
  exp: number; // saniye (unix)
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET tanımlı değil veya çok kısa (>=16 karakter gerekli).");
  }
  return secret;
}

function sign(data: string, secret: string): string {
  return b64url(createHmac(ALG, secret).update(data).digest());
}

/**
 * Verilen sub için imzalı token üretir.
 * @param nowS  Test edilebilirlik için enjekte edilebilir "şimdi" (saniye).
 */
export function createSessionToken(sub: string, nowS: number = Math.floor(Date.now() / 1000)): string {
  const payload: SessionPayload = { sub, iat: nowS, exp: nowS + SESSION_MAX_AGE_S };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = sign(body, getSecret());
  return `${body}.${sig}`;
}

/**
 * Token'ı doğrular: imza geçerli + süresi dolmamış. Geçersizse null.
 * @param nowS  Test edilebilirlik için enjekte edilebilir "şimdi" (saniye).
 */
export function verifySessionToken(
  token: string | undefined | null,
  nowS: number = Math.floor(Date.now() / 1000),
): SessionPayload | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(body, getSecret());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp < nowS) return null;
  return payload;
}

/**
 * Girilen parolayı AUTH_PASSWORD ile timing-safe karşılaştırır.
 */
export function verifyPassword(input: string | undefined | null): boolean {
  const expected = process.env.AUTH_PASSWORD;
  if (!expected) throw new Error("AUTH_PASSWORD tanımlı değil.");
  if (!input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  // Uzunluk sızıntısını da örtmek için sabit uzunlukta hash karşılaştırması.
  const ha = createHmac(ALG, "cmp").update(a).digest();
  const hb = createHmac(ALG, "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}
