import { queryOptions } from "@tanstack/react-query";

import { getContents } from "@/features/content/api/getContents";
import type { ContentFilters } from "@/features/content/model/content";

export const CONTENTS_STALE_TIME = 2 * 60 * 1_000;
export const CONTENTS_GC_TIME = 10 * 60 * 1_000;

function normalizeFilters(filters: ContentFilters): ContentFilters {
  return {
    page: filters.page,
    search: filters.search.trim(),
    status: filters.status,
  };
}

export const contentKeys = {
  all: ["contents"] as const,
  lists: () => [...contentKeys.all, "list"] as const,
  list: (filters: ContentFilters) =>
    [...contentKeys.lists(), normalizeFilters(filters)] as const,
};

export function contentListQueryOptions(filters: ContentFilters) {
  const normalizedFilters = normalizeFilters(filters);

  return queryOptions({
    queryKey: contentKeys.list(normalizedFilters),
    queryFn: () => getContents(normalizedFilters),
    staleTime: CONTENTS_STALE_TIME,
    gcTime: CONTENTS_GC_TIME,
  });
}
