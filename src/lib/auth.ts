import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "velora_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt: Date;
};

let ephemeralSecret: string | null = null;
let ephemeralSecretWarned = false;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // Zero-config demo deployments (e.g. Vercel without env vars) fall back
    // to an ephemeral per-process secret. Sessions signed with it are valid
    // only while that server instance is alive, so users may be signed out
    // when instances recycle. Real deployments should always set
    // SESSION_SECRET to a stable 32+ character random string.
    if (!ephemeralSecretWarned) {
      console.warn(
        "[velora] SESSION_SECRET is not set (or shorter than 32 chars) — using an ephemeral in-memory secret. Sessions will not survive server restarts.",
      );
      ephemeralSecretWarned = true;
    }
    ephemeralSecret ??= randomBytes(32).toString("hex");
    return ephemeralSecret;
  }
  return secret;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function signToken(token: string) {
  return createHmac("sha256", sessionSecret()).update(token).digest("base64url");
}

function encodeCookie(token: string) {
  return `${token}.${signToken(token)}`;
}

function decodeCookie(value: string): string | null {
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const token = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  const expected = Buffer.from(signToken(token));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return null;
  if (!timingSafeEqual(expected, received)) return null;

  return token;
}

function toSessionUser(user: {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  createdAt: Date;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    createdAt: user.createdAt,
  };
}

/** Create a new server session and set the signed, http-only cookie. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.session.create({
    data: { id: hashToken(token), userId, expiresAt },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, encodeCookie(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Revoke the current session in the database and clear the cookie. */
export async function destroySession() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw) {
    const token = decodeCookie(raw);
    if (token) {
      await db.session.deleteMany({ where: { id: hashToken(token) } });
    }
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Read and validate the current session. Memoized per request so multiple
 * components/layouts share a single database lookup.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const token = decodeCookie(raw);
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return toSessionUser(session.user);
});

/** Guard for authenticated pages. Redirects to sign-in with a return path. */
export async function requireUser(nextPath = "/account") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

/** Guard for administrator-only pages and server actions. */
export async function requireAdmin(nextPath = "/admin") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}
