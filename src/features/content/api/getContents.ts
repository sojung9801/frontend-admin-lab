import type { Content } from "@/features/content/model/content";

const CONTENTS_API_URL = "/api/contents";

export async function getContents(): Promise<Content[]> {
  const response = await fetch(CONTENTS_API_URL);

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
