import { test, expect } from "@playwright/test";
import { loginAsTeacher, loginAsChild, TEST_ACCOUNTS } from "./helpers";

// ---------------------------------------------------------------------------
// Redirect-to-login guards
// ---------------------------------------------------------------------------

test("unauthenticated user is redirected to /login from /child", async ({ page }) => {
  await page.goto("/child");
  await expect(page).toHaveURL(/\/login/);
});

test("unauthenticated user is redirected to /login from /teacher", async ({ page }) => {
  await page.goto("/teacher");
  await expect(page).toHaveURL(/\/login/);
});

// ---------------------------------------------------------------------------
// Role-based access guards
// ---------------------------------------------------------------------------

test("teacher accessing /child is redirected to /teacher", async ({ page }) => {
  await loginAsTeacher(page, TEST_ACCOUNTS.teacher.email, TEST_ACCOUNTS.teacher.password);
  await page.goto("/child");
  await expect(page).toHaveURL(/\/teacher/);
});

test("child accessing /teacher is redirected to /child", async ({ page }) => {
  await loginAsChild(page, TEST_ACCOUNTS.child.email, TEST_ACCOUNTS.child.password);
  await page.goto("/teacher");
  await expect(page).toHaveURL(/\/child/);
});
