import type { Content } from "@/features/content/model/content";

export async function GET() {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return Response.json(
      { message: "API_URL 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    const contentsUrl = new URL("/posts", apiUrl);
    contentsUrl.searchParams.set("_limit", "12");

    const response = await fetch(contentsUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        { message: "콘텐츠 원본 데이터를 불러오지 못했습니다." },
        { status: 502 },
      );
    }

    const contents = (await response.json()) as Content[];

    return Response.json(contents);
  } catch {
    return Response.json(
      { message: "콘텐츠 서비스에 연결할 수 없습니다." },
      { status: 503 },
    );
  }
}
