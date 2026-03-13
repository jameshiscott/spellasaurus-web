import type { Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Test account constants
// ---------------------------------------------------------------------------

export const TEST_ACCOUNTS = {
  child: {
    email: "test-child@spellasaurus.internal",
    password: "TestChild123!",
  },
  teacher: {
    email: "test-teacher@example.com",
    password: "TestTeacher123!",
  },
  parent: {
    email: "test-parent@example.com",
    password: "TestParent123!",
  },
  admin: {
    email: "test-admin@example.com",
    password: "TestAdmin123!",
  },
} as const;

// ---------------------------------------------------------------------------
// Login helpers
// ---------------------------------------------------------------------------

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in|login/i }).click();
  // Wait until the browser navigates away from /login
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function loginAsChild(page: Page, email: string, password: string): Promise<void> {
  await login(page, email, password);
}

export async function loginAsTeacher(page: Page, email: string, password: string): Promise<void> {
  await login(page, email, password);
}

export async function loginAsParent(page: Page, email: string, password: string): Promise<void> {
  await login(page, email, password);
}

export async function loginAsAdmin(page: Page, email: string, password: string): Promise<void> {
  await login(page, email, password);
}
