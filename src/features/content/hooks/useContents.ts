"use client";

import { useQuery } from "@tanstack/react-query";

import { getContents } from "@/features/content/api/getContents";
import type { ContentFilters } from "@/features/content/model/content";

export function useContents(filters: ContentFilters) {
  return useQuery({
    queryKey: ["contents", filters.search.trim(), filters.status],
    queryFn: () => getContents(filters),
    staleTime: 60_000,
  });
}
