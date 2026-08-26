import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useContents } from "@/features/content/hooks/useContents";
import type {
  Content,
  ContentFilters,
} from "@/features/content/model/content";

import messages from "../../../../messages/ko.json";

import ContentList from "./ContentList";

vi.mock("@/features/content/hooks/useContents", () => ({
  useContents: vi.fn(),
}));

const content: Content = {
  id: 1,
  userId: 1,
  title: "React 관리자 화면 만들기",
  body: "페이지네이션 테스트를 위한 콘텐츠입니다.",
  status: "published",
};

const useContentsMock = vi.mocked(useContents);

function createUseContentsResult(page: number) {
  return {
    data: {
      items: [content],
      pagination: {
        page,
        pageSize: 12,
        total: 25,
        totalPages: 3,
        hasPreviousPage: page > 1,
        hasNextPage: page < 3,
      },
    },
    error: null,
    isFetching: false,
    isPending: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useContents>;
}

function getLastFilters(): ContentFilters {
  const lastCall = useContentsMock.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("useContents가 호출되지 않았습니다.");
  }

  return lastCall[0];
}

function renderContentList() {
  return render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      <ContentList />
    </NextIntlClientProvider>,
  );
}

describe("ContentList 페이지네이션", () => {
  beforeEach(() => {
    useContentsMock.mockImplementation(({ page }) =>
      createUseContentsResult(page),
    );
  });

  it("다음과 이전 버튼으로 현재 페이지를 변경한다", () => {
    renderContentList();

    const previousButton = screen.getByRole("button", { name: "이전" });
    const nextButton = screen.getByRole("button", { name: "다음" });

    expect(screen.getByText("1 / 3 페이지")).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);

    expect(getLastFilters()).toEqual({ search: "", status: "all", page: 2 });
    expect(screen.getByText("2 / 3 페이지")).toBeInTheDocument();
    expect(previousButton).toBeEnabled();

    fireEvent.click(previousButton);

    expect(getLastFilters()).toEqual({ search: "", status: "all", page: 1 });
    expect(screen.getByText("1 / 3 페이지")).toBeInTheDocument();
  });

  it("마지막 페이지에서는 다음 버튼을 비활성화한다", () => {
    renderContentList();

    const nextButton = screen.getByRole("button", { name: "다음" });

    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    expect(getLastFilters().page).toBe(3);
    expect(screen.getByText("3 / 3 페이지")).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  it("검색어나 상태가 변경되면 첫 페이지로 돌아간다", () => {
    renderContentList();

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.change(screen.getByLabelText("제목 검색"), {
      target: { value: "react" },
    });

    expect(getLastFilters()).toEqual({
      search: "react",
      status: "all",
      page: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.change(screen.getByLabelText("상태"), {
      target: { value: "published" },
    });

    expect(getLastFilters()).toEqual({
      search: "react",
      status: "published",
      page: 1,
    });
  });
});
