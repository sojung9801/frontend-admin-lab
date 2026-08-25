import type {
  Content,
  ContentFilters,
} from "@/features/content/model/content";

const CONTENTS_API_URL = "/api/contents";

export async function getContents({
  search,
  status,
}: ContentFilters): Promise<Content[]> {
  const searchParams = new URLSearchParams();
  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    searchParams.set("search", normalizedSearch);
  }

  if (status !== "all") {
    searchParams.set("status", status);
  }

  const query = searchParams.toString();
  const requestUrl = query ? `${CONTENTS_API_URL}?${query}` : CONTENTS_API_URL;
  const response = await fetch(requestUrl);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(
      errorBody?.message ??
        `콘텐츠를 불러오지 못했습니다. (${response.status})`,
    );
  }

  return response.json() as Promise<Content[]>;
}
