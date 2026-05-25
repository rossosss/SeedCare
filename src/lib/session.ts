import { SignJWT, jwtVerify } from "jose";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, type SessionUser } from "@/lib/auth";

const SESSION_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";
const encodedSecret = new TextEncoder().encode(SESSION_SECRET);

export type SessionPayload = SessionUser;

export async function signSessionToken(user: SessionUser) {
  if (process.env.NODE_ENV === "production" && SESSION_SECRET === "change-me-in-production") {
    throw new Error("JWT_SECRET must be changed in production.");
  }

  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(encodedSecret);
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, encodedSecret);

    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role === "ADMIN" ? "ADMIN" : "USER"
    };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}
