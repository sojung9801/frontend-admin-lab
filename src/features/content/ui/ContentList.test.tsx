import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Content } from "@/features/content/model/content";

import messages from "../../../../messages/ko.json";

import ContentList from "./ContentList";

const navigationMock = vi.hoisted(() => {
  let searchParams = new URLSearchParams();

  return {
    router: {
      push: vi.fn(),
      replace: vi.fn(),
    },
    getSearchParams: () => searchParams,
    setSearchParams: (query = "") => {
      searchParams = new URLSearchParams(query);
    },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/ko",
  useRouter: () => navigationMock.router,
  useSearchParams: () => navigationMock.getSearchParams(),
}));

const content: Content = {
  id: 1,
  userId: 1,
  title: "React 관리자 화면 만들기",
  body: "URL query 동기화 테스트를 위한 콘텐츠입니다.",
  status: "published",
};

const fetchMock = vi.fn();

function createContentsResponse(requestUrl: string) {
  const page = Number(new URL(requestUrl, "http://localhost").searchParams.get("page"));

  return Response.json({
    items: [content],
    pagination: {
      page,
      pageSize: 12,
      total: 25,
      totalPages: 3,
      hasPreviousPage: page > 1,
      hasNextPage: page < 3,
    },
  });
}

function getLastRequestParams() {
  const lastCall = fetchMock.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("fetch가 호출되지 않았습니다.");
  }

  return new URL(String(lastCall[0]), "http://localhost").searchParams;
}

function renderContentList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="ko" messages={messages}>
        <ContentList />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("ContentList URL query 동기화", () => {
  beforeEach(() => {
    navigationMock.setSearchParams();
    fetchMock.mockImplementation((input: string) =>
      Promise.resolve(createContentsResponse(input)),
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("URL에서 검색어, 상태, 페이지를 읽는다", async () => {
    navigationMock.setSearchParams("page=2&search=react&status=published");

    renderContentList();

    expect(await screen.findByText("2 / 3 페이지")).toBeInTheDocument();
    expect(screen.getByLabelText("제목 검색")).toHaveValue("react");
    expect(screen.getByLabelText("상태")).toHaveValue("published");

    const requestParams = getLastRequestParams();
    expect(requestParams.get("page")).toBe("2");
    expect(requestParams.get("search")).toBe("react");
    expect(requestParams.get("status")).toBe("published");
  });

  it("페이지 이동 시 URL을 갱신한다", async () => {
    navigationMock.setSearchParams("page=2");
    renderContentList();

    expect(await screen.findByText("2 / 3 페이지")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(navigationMock.router.push).toHaveBeenNthCalledWith(1, "/ko", {
      scroll: false,
    });
    expect(navigationMock.router.push).toHaveBeenNthCalledWith(
      2,
      "/ko?page=3",
      { scroll: false },
    );
  });

  it("마지막 페이지에서는 다음 버튼을 비활성화한다", async () => {
    navigationMock.setSearchParams("page=3");
    renderContentList();

    expect(await screen.findByText("3 / 3 페이지")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("검색어나 상태 변경 시 page를 제거하고 URL을 갱신한다", async () => {
    navigationMock.setSearchParams("page=2&search=react&status=draft");
    renderContentList();

    expect(await screen.findByText("2 / 3 페이지")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("제목 검색"), {
      target: { value: "next" },
    });
    fireEvent.change(screen.getByLabelText("상태"), {
      target: { value: "published" },
    });

    expect(navigationMock.router.push).toHaveBeenNthCalledWith(
      1,
      "/ko?search=next&status=draft",
      { scroll: false },
    );
    expect(navigationMock.router.push).toHaveBeenNthCalledWith(
      2,
      "/ko?search=react&status=published",
      { scroll: false },
    );
  });

  it("잘못된 page 값은 1페이지로 보정하고 URL에서 제거한다", async () => {
    navigationMock.setSearchParams("page=invalid&search=react&status=published");

    renderContentList();

    expect(await screen.findByText("1 / 3 페이지")).toBeInTheDocument();
    expect(getLastRequestParams().get("page")).toBe("1");
    await waitFor(() => {
      expect(navigationMock.router.replace).toHaveBeenCalledWith(
        "/ko?search=react&status=published",
        { scroll: false },
      );
    });
  });

  it("정규화 결과가 같은 URL이면 router.push를 호출하지 않는다", async () => {
    navigationMock.setSearchParams("search=react");
    renderContentList();

    expect(await screen.findByText("1 / 3 페이지")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("제목 검색"), {
      target: { value: "react " },
    });

    expect(navigationMock.router.push).not.toHaveBeenCalled();
  });
});
