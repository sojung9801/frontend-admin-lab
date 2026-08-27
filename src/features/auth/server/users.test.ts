import { describe, expect, it } from "vitest";

import { authenticateUser, findUserById } from "./users";

describe("demo users", () => {
  it("관리자 계정으로 로그인하면 비밀번호를 제외한 사용자 정보를 반환한다", () => {
    expect(authenticateUser("ADMIN@example.com", "admin1234")).toEqual({
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
    });
  });

  it("뷰어 역할을 사용자 정보에 포함한다", () => {
    expect(findUserById("viewer-1")).toMatchObject({ role: "viewer" });
  });

  it("잘못된 비밀번호에는 사용자 정보를 반환하지 않는다", () => {
    expect(authenticateUser("admin@example.com", "wrong-password")).toBeNull();
  });
});
