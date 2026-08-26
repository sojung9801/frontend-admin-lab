import { expect, test } from "@playwright/test";

const firstPageItems = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  userId: 1,
  title: `첫 페이지 콘텐츠 ${index + 1}`,
  body: `첫 페이지 본문 ${index + 1}`,
  status: index % 3 === 2 ? "draft" : "published",
}));

const secondPageItems = [
  {
    id: 13,
    userId: 1,
    title: "두 번째 페이지 콘텐츠",
    body: "마지막 페이지 본문",
    status: "published",
  },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/contents?*", async (route) => {
    const requestUrl = new URL(route.request().url());
    const requestedPage = Number(requestUrl.searchParams.get("page") ?? "1");
    const isFirstPage = requestedPage === 1;

    await route.fulfill({
      json: {
        items: isFirstPage ? firstPageItems : secondPageItems,
        pagination: {
          page: requestedPage,
          pageSize: 12,
          total: 13,
          totalPages: 2,
          hasPreviousPage: !isFirstPage,
          hasNextPage: isFirstPage,
        },
      },
    });
  });
});

test("페이지 이동을 URL에 반영하고 새로고침 후에도 유지한다", async ({
  page,
}) => {
  await page.goto("/ko");

  const previousButton = page.getByRole("button", { name: "이전" });
  const nextButton = page.getByRole("button", { name: "다음" });

  await expect(
    page.getByRole("heading", { name: "첫 페이지 콘텐츠 1", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1 / 2 페이지")).toBeVisible();
  await expect(previousButton).toBeDisabled();
  await expect(nextButton).toBeEnabled();

  await nextButton.click();

  await expect(page).toHaveURL(/\/ko\?page=2$/);
  await expect(
    page.getByRole("heading", { name: "두 번째 페이지 콘텐츠" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "첫 페이지 콘텐츠 1", exact: true }),
  ).not.toBeVisible();
  await expect(page.getByText("2 / 2 페이지")).toBeVisible();
  await expect(previousButton).toBeEnabled();
  await expect(nextButton).toBeDisabled();

  await page.reload();

  await expect(page.getByText("2 / 2 페이지")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "두 번째 페이지 콘텐츠" }),
  ).toBeVisible();

  await previousButton.click();

  await expect(page).toHaveURL(/\/ko$/);
  await expect(
    page.getByRole("heading", { name: "첫 페이지 콘텐츠 1", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1 / 2 페이지")).toBeVisible();
});

test("URL의 검색어와 상태를 화면에 복원하고 변경 사항을 반영한다", async ({
  page,
}) => {
  await page.goto("/ko?page=2&search=react&status=published");

  await expect(page.getByLabel("제목 검색")).toHaveValue("react");
  await expect(page.getByLabel("상태")).toHaveValue("published");
  await expect(page.getByText("2 / 2 페이지")).toBeVisible();

  await page.reload();

  await expect(page.getByLabel("제목 검색")).toHaveValue("react");
  await expect(page.getByLabel("상태")).toHaveValue("published");
  await expect(page.getByText("2 / 2 페이지")).toBeVisible();

  await page.getByLabel("제목 검색").fill("next");

  await expect(page).toHaveURL(/\/ko\?search=next&status=published$/);
  await expect(page.getByText("1 / 2 페이지")).toBeVisible();

  await page.getByLabel("언어").selectOption("en");

  await expect(page).toHaveURL(/\/en\?search=next&status=published$/);
  await expect(page.getByLabel("Search by title")).toHaveValue("next");
});

test("잘못된 page 값을 1페이지로 보정한다", async ({ page }) => {
  await page.goto("/ko?page=invalid&search=react");

  await expect(page).toHaveURL(/\/ko\?search=react$/);
  await expect(page.getByLabel("제목 검색")).toHaveValue("react");
  await expect(page.getByText("1 / 2 페이지")).toBeVisible();
});
