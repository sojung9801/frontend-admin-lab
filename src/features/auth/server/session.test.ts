import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionToken, readSessionToken } from "./session";

describe("session token", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("서명된 세션을 읽는다", () => {
    const payload = { expiresAt: Date.now() + 60_000, userId: "admin-1" };
    const token = createSessionToken(payload);

    expect(readSessionToken(token)).toEqual(payload);
  });

  it("변조된 세션을 거부한다", () => {
    const token = createSessionToken({
      expiresAt: Date.now() + 60_000,
      userId: "admin-1",
    });
    const [payload, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ expiresAt: Date.now() + 60_000, userId: "viewer-1" }),
    ).toString("base64url");

    expect(readSessionToken(`${tamperedPayload}.${signature}`)).toBeNull();
    expect(payload).not.toBe(tamperedPayload);
  });

  it("만료된 세션을 거부한다", () => {
    const token = createSessionToken({
      expiresAt: Date.now() - 1,
      userId: "admin-1",
    });

    expect(readSessionToken(token)).toBeNull();
  });
});
