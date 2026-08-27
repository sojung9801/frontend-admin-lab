import { expect, test } from "@playwright/test";

test("미로그인 사용자를 로그인 화면으로 이동시킨다", async ({ page }) => {
  await page.goto("/ko/admin");

  await expect(page).toHaveURL(/\/ko\/login$/);
  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
});

test("locale 루트에서는 콘텐츠를 노출하지 않고 로그인 화면으로 이동한다", async ({
  page,
}) => {
  await page.goto("/ko");
  await expect(page).toHaveURL(/\/ko\/login$/);

  await page.goto("/en");
  await expect(page).toHaveURL(/\/en\/login$/);
});

test("로그인 상태를 새로고침 후에도 유지하고 로그아웃한다", async ({
  page,
}) => {
  await page.route("**/api/contents?*", (route) =>
    route.fulfill({
      json: {
        items: [],
        pagination: {
          page: 1,
          pageSize: 12,
          total: 0,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    }),
  );

  await page.goto("/ko/login");
  await page.getByLabel("이메일").fill("admin@example.com");
  await page.getByLabel("비밀번호").fill("admin1234");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(/\/ko\/admin$/);
  await expect(page.getByText("admin@example.com")).toBeVisible();
  await expect(page.getByText("관리자", { exact: true })).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(/\/ko\/admin$/);
  await expect(page.getByText("admin@example.com")).toBeVisible();

  await page.getByRole("button", { name: "로그아웃" }).click();

  await expect(page).toHaveURL(/\/ko\/login$/);
  await page.goto("/ko/admin");
  await expect(page).toHaveURL(/\/ko\/login$/);
});
