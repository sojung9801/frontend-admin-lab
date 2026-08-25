"use client";

import { useQuery } from "@tanstack/react-query";

import { getContents } from "@/features/content/api/getContents";

export function useContents() {
  return useQuery({
    queryKey: ["contents"],
    queryFn: getContents,
    staleTime: 60_000,
  });
}
