"use client";

import { useQuery } from "@tanstack/react-query";

import type { ContentFilters } from "@/features/content/model/content";
import { contentListQueryOptions } from "@/features/content/model/contentQueries";

export function useContents(filters: ContentFilters) {
  return useQuery(contentListQueryOptions(filters));
}
