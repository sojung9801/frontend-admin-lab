import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentFilters } from "@/features/content/model/content";

import {
  CONTENTS_GC_TIME,
  CONTENTS_STALE_TIME,
  contentKeys,
  contentListQueryOptions,
} from "./contentQueries";

const defaultFilters: ContentFilters = {
  page: 1,
  search: "",
  status: "all",
};

describe("content query options", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("검색어, 상태, 페이지를 정규화해 queryKey에 포함한다", () => {
    expect(
      contentKeys.list({
        page: 2,
        search: "  react query  ",
        status: "published",
      }),
    ).toEqual([
      "contents",
      "list",
      { page: 2, search: "react query", status: "published" },
    ]);
  });

  it("검색어, 상태, 페이지 중 하나만 달라도 서로 다른 queryKey를 만든다", () => {
    const baseKey = contentKeys.list(defaultFilters);

    expect(contentKeys.list({ ...defaultFilters, search: "react" })).not.toEqual(
      baseKey,
    );
    expect(
      contentKeys.list({ ...defaultFilters, status: "draft" }),
    ).not.toEqual(baseKey);
    expect(contentKeys.list({ ...defaultFilters, page: 2 })).not.toEqual(
      baseKey,
    );
  });

  it("목록 탐색에 맞는 staleTime과 gcTime을 설정한다", () => {
    const options = contentListQueryOptions(defaultFilters);

    expect(options.staleTime).toBe(CONTENTS_STALE_TIME);
    expect(options.gcTime).toBe(CONTENTS_GC_TIME);
    expect(CONTENTS_STALE_TIME).toBe(120_000);
    expect(CONTENTS_GC_TIME).toBe(600_000);
  });

  it("fresh 상태의 같은 페이지를 다시 요청하지 않고 캐시에서 반환한다", async () => {
    const response = {
      items: [],
      pagination: {
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    const queryClient = new QueryClient();
    const options = contentListQueryOptions(defaultFilters);

    vi.stubGlobal("fetch", fetchMock);

    await queryClient.query(options);
    await queryClient.query(options);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(options.queryKey)).toEqual(response);

    queryClient.clear();
  });
});
