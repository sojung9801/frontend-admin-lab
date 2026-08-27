import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "../model/sessionCookie";
import { findUserById } from "./users";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const DEVELOPMENT_SESSION_SECRET =
  "frontend-admin-lab-development-session-secret";

type SessionPayload = {
  expiresAt: number;
  userId: string;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET 환경 변수를 설정해야 합니다.");
  }

  return DEVELOPMENT_SESSION_SECRET;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.userId === "string" &&
    typeof payload.expiresAt === "number" &&
    payload.expiresAt > Date.now()
  );
}

export function createSessionToken(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature, extraPart] = token.split(".");

  if (!encodedPayload || !signature || extraPart) {
    return null;
  }

  const expectedSignature = Buffer.from(sign(encodedPayload), "base64url");
  const receivedSignature = Buffer.from(signature, "base64url");

  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );

    return isSessionPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const token = createSessionToken({ expiresAt, userId });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = readSessionToken(token);

  return session ? findUserById(session.userId) : null;
}
