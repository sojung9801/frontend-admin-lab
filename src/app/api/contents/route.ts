import type {
  Content,
  ContentStatus,
} from "@/features/content/model/content";

type SourceContent = Omit<Content, "status">;

const contentStatuses = ["published", "draft"] as const;

function isContentStatus(value: string): value is ContentStatus {
  return contentStatuses.some((status) => status === value);
}

export async function GET(request: Request) {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return Response.json(
      { message: "API_URL 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const requestUrl = new URL(request.url);
  const search = requestUrl.searchParams.get("search")?.trim().toLowerCase();
  const statusParam = requestUrl.searchParams.get("status")?.trim();

  if (statusParam && !isContentStatus(statusParam)) {
    return Response.json(
      { message: "지원하지 않는 콘텐츠 상태입니다." },
      { status: 400 },
    );
  }

  try {
    const contentsUrl = new URL("/posts", apiUrl);

    const response = await fetch(contentsUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        { message: "콘텐츠 원본 데이터를 불러오지 못했습니다." },
        { status: 502 },
      );
    }

    const sourceContents = (await response.json()) as SourceContent[];
    const contents = sourceContents
      .map<Content>((content) => ({
        ...content,
        status: content.id % 3 === 0 ? "draft" : "published",
      }))
      .filter((content) => {
        const matchesSearch = search
          ? content.title.toLowerCase().includes(search)
          : true;
        const matchesStatus = statusParam
          ? content.status === statusParam
          : true;

        return matchesSearch && matchesStatus;
      });

    return Response.json(contents);
  } catch {
    return Response.json(
      { message: "콘텐츠 서비스에 연결할 수 없습니다." },
      { status: 503 },
    );
  }
}
