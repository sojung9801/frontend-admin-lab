import type {
  ContentFilters,
  ContentsResponse,
} from "@/features/content/model/content";

const CONTENTS_API_URL = "/api/contents";

export async function getContents({
  search,
  status,
  page,
}: ContentFilters): Promise<ContentsResponse> {
  const searchParams = new URLSearchParams();
  const normalizedSearch = search.trim();

  searchParams.set("page", String(page));

  if (normalizedSearch) {
    searchParams.set("search", normalizedSearch);
  }

  if (status !== "all") {
    searchParams.set("status", status);
  }

  const response = await fetch(`${CONTENTS_API_URL}?${searchParams.toString()}`);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(
      errorBody?.message ??
        `콘텐츠를 불러오지 못했습니다. (${response.status})`,
    );
  }

  return response.json() as Promise<ContentsResponse>;
}
