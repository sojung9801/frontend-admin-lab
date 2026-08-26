import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const sourceContents = Array.from({ length: 13 }, (_, index) => ({
  id: index + 1,
  userId: 1,
  title: `콘텐츠 ${index + 1}`,
  body: `본문 ${index + 1}`,
}));

const fetchMock = vi.fn();

describe("GET /api/contents 페이지네이션", () => {
  beforeEach(() => {
    vi.stubEnv("API_URL", "https://example.com");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(Response.json(sourceContents));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each(["0", "-1", "1.5", "invalid"])(
    "잘못된 page=%s 요청에 400을 반환한다",
    async (page) => {
      const response = await GET(
        new Request(`http://localhost/api/contents?page=${page}`),
      );

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        message: "page는 1 이상의 정수여야 합니다.",
      });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("두 번째 페이지의 항목과 페이지 정보를 반환한다", async () => {
    const response = await GET(
      new Request("http://localhost/api/contents?page=2"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ id: 13, status: "published" });
    expect(body.pagination).toEqual({
      page: 2,
      pageSize: 12,
      total: 13,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });

  it("마지막 페이지를 초과하면 400을 반환한다", async () => {
    const response = await GET(
      new Request("http://localhost/api/contents?page=3"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "존재하지 않는 페이지입니다.",
    });
  });
});
