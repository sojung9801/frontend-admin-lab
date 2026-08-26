import { describe, expect, it } from "vitest";

import {
  areContentFiltersEqual,
  createContentUrl,
  hasInvalidPage,
  parseContentFilters,
  removeInvalidPage,
} from "./contentQuery";

describe("contentQuery", () => {
  it("URL query를 콘텐츠 조회 조건으로 변환한다", () => {
    const searchParams = new URLSearchParams(
      "page=2&search=%20react%20&status=published",
    );

    expect(parseContentFilters(searchParams)).toEqual({
      page: 2,
      search: "react",
      status: "published",
    });
  });

  it.each(["0", "-1", "1.5", "invalid"])(
    "잘못된 page=%s를 1로 변환한다",
    (page) => {
      const searchParams = new URLSearchParams({ page });

      expect(parseContentFilters(searchParams).page).toBe(1);
      expect(hasInvalidPage(searchParams)).toBe(true);
    },
  );

  it("기본값을 생략하고 정해진 순서로 URL을 생성한다", () => {
    expect(
      createContentUrl("/ko", {
        page: 2,
        search: " react ",
        status: "published",
      }),
    ).toBe("/ko?page=2&search=react&status=published");

    expect(
      createContentUrl("/ko", { page: 1, search: "", status: "all" }),
    ).toBe("/ko");
  });

  it("잘못된 page만 제거하고 다른 query는 유지한다", () => {
    const searchParams = new URLSearchParams(
      "page=invalid&search=react&status=draft",
    );

    expect(removeInvalidPage("/ko", searchParams)).toBe(
      "/ko?search=react&status=draft",
    );
  });

  it("동일한 조회 조건을 판별한다", () => {
    const filters = { page: 2, search: "react", status: "published" } as const;

    expect(areContentFiltersEqual(filters, { ...filters })).toBe(true);
    expect(
      areContentFiltersEqual(filters, { ...filters, page: 3 }),
    ).toBe(false);
  });
});
