import { test, expect } from "@playwright/test";
import { loginAsChild, TEST_ACCOUNTS } from "./helpers";

// ---------------------------------------------------------------------------
// Spelling practice flow
// requires seeded test data
// ---------------------------------------------------------------------------

// eslint-disable-next-line playwright/no-skipped-test
test.skip("child completes a spelling session and sees results screen", async ({ page }) => {
  // requires seeded test data

  // 1. Login as child
  await loginAsChild(page, TEST_ACCOUNTS.child.email, TEST_ACCOUNTS.child.password);

  // 2. Navigate to the word-set list
  await page.goto("/child/sets");

  // 3. Click the first available set
  await page.getByRole("link", { name: /practice/i }).first().click();

  // 4. Fill the spelling input for each word in the set
  //    Assumes a text input is visible for each word, one at a time.
  const input = page.getByRole("textbox", { name: /spell|answer/i });
  while (await input.isVisible()) {
    await input.fill("placeholder");
    await page.getByRole("button", { name: /submit|next|check/i }).click();
    // Brief wait to allow the UI to advance to the next word
    await page.waitForTimeout(300);
  }

  // 5. Assert results screen is shown with star rating and coins earned
  await expect(page).toHaveURL(/\/child\/results\//);
  await expect(page.getByTestId("star-rating")).toBeVisible();
  await expect(page.getByTestId("coins-earned")).toBeVisible();
});
