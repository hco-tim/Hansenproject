import "server-only";
import { createHash, createHmac, hkdfSync, randomBytes, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "hansen_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

type SessionPayload = {
  expiresAt: number;
  nonce: string;
};

function getSessionKey() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;

  return Buffer.from(
    hkdfSync(
      "sha256",
      password,
      "hansen-projects-admin-session-salt-v1",
      "hansen-projects-admin-session-signing-key-v1",
      32,
    ),
  );
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sign(payload: string, key: Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createAdminSession() {
  const key = getSessionKey();
  if (!key) throw new Error("ADMIN_PASSWORD belum dikonfigurasi di server.");

  const payload: SessionPayload = {
    expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, key)}`;
}

export function verifyAdminSession(token: string | undefined) {
  const key = getSessionKey();
  if (!key || !token) return false;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra !== undefined) return false;

  const expected = Buffer.from(sign(encodedPayload, key), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    return Number.isFinite(payload.expiresAt) && payload.expiresAt > Date.now() && typeof payload.nonce === "string";
  } catch {
    return false;
  }
}

export function hasAdminSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  return verifyAdminSession(cookie?.slice(ADMIN_SESSION_COOKIE.length + 1));
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin === new URL(request.url).origin;
    } catch {
      return false;
    }
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

export function passwordMatches(candidate: unknown) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || typeof candidate !== "string") return false;

  const expectedHash = createHash("sha256").update(expectedPassword).digest();
  const candidateHash = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(expectedHash, candidateHash);
}
