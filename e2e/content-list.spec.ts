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

test("사용자가 다음과 이전 페이지로 이동한다", async ({ page }) => {
  await page.route("**/api/contents?*", async (route) => {
    const requestUrl = new URL(route.request().url());
    const requestedPage = Number(requestUrl.searchParams.get("page"));
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

  await expect(
    page.getByRole("heading", { name: "두 번째 페이지 콘텐츠" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "첫 페이지 콘텐츠 1", exact: true }),
  ).not.toBeVisible();
  await expect(page.getByText("2 / 2 페이지")).toBeVisible();
  await expect(previousButton).toBeEnabled();
  await expect(nextButton).toBeDisabled();

  await previousButton.click();

  await expect(
    page.getByRole("heading", { name: "첫 페이지 콘텐츠 1", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1 / 2 페이지")).toBeVisible();
});
