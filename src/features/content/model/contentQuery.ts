import type {
  ContentFilters,
  ContentStatus,
} from "@/features/content/model/content";

type ContentSearchParams = Pick<URLSearchParams, "get" | "toString">;

const contentStatuses: ContentStatus[] = ["published", "draft"];

function isContentStatus(value: string | null): value is ContentStatus {
  return value !== null && contentStatuses.some((status) => status === value);
}

function isValidPageValue(value: string) {
  const page = Number(value);

  return Number.isInteger(page) && page >= 1;
}

function parsePage(value: string | null) {
  return value !== null && isValidPageValue(value) ? Number(value) : 1;
}

function buildUrl(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function parseContentFilters(
  searchParams: ContentSearchParams,
): ContentFilters {
  const status = searchParams.get("status");

  return {
    page: parsePage(searchParams.get("page")),
    search: searchParams.get("search")?.trim() ?? "",
    status: isContentStatus(status) ? status : "all",
  };
}

export function hasInvalidPage(searchParams: ContentSearchParams) {
  const page = searchParams.get("page");

  return page !== null && !isValidPageValue(page);
}

export function createContentUrl(pathname: string, filters: ContentFilters) {
  const searchParams = new URLSearchParams();
  const normalizedSearch = filters.search.trim();

  if (filters.page > 1) {
    searchParams.set("page", String(filters.page));
  }

  if (normalizedSearch) {
    searchParams.set("search", normalizedSearch);
  }

  if (filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  return buildUrl(pathname, searchParams);
}

export function removeInvalidPage(
  pathname: string,
  searchParams: ContentSearchParams,
) {
  const correctedSearchParams = new URLSearchParams(searchParams.toString());
  correctedSearchParams.delete("page");

  return buildUrl(pathname, correctedSearchParams);
}

export function areContentFiltersEqual(
  currentFilters: ContentFilters,
  nextFilters: ContentFilters,
) {
  return (
    currentFilters.page === nextFilters.page &&
    currentFilters.search === nextFilters.search &&
    currentFilters.status === nextFilters.status
  );
}
