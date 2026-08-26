import type {
  Content,
  ContentStatus,
} from "@/features/content/model/content";

type SourceContent = Omit<Content, "status">;

const contentStatuses = ["published", "draft"] as const;
const PAGE_SIZE = 12;

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
  const pageParam = requestUrl.searchParams.get("page")?.trim() ?? "1";
  const page = Number(pageParam);

  if (!Number.isInteger(page) || page < 1) {
    return Response.json(
      { message: "page는 1 이상의 정수여야 합니다." },
      { status: 400 },
    );
  }

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
    const filteredContents = sourceContents
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

    const total = filteredContents.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    if (page > Math.max(totalPages, 1)) {
      return Response.json(
        { message: "존재하지 않는 페이지입니다." },
        { status: 400 },
      );
    }

    const startIndex = (page - 1) * PAGE_SIZE;
    const items = filteredContents.slice(startIndex, startIndex + PAGE_SIZE);

    return Response.json({
      items,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch {
    return Response.json(
      { message: "콘텐츠 서비스에 연결할 수 없습니다." },
      { status: 503 },
    );
  }
}
