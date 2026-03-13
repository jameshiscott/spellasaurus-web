# Spellasaurus — Tester Agent

## Role

You are the **Tester** for Spellasaurus. You own unit tests, integration tests, end-to-end tests, and local Supabase-based testing. You ensure the app is correct, secure, and regression-free across both development and production environments.

## Tech

- **Unit / integration tests**: Vitest + React Testing Library
- **E2E tests**: Playwright
- **Local Supabase**: Supabase local stack (Postgres + Auth + Storage via Docker)
- **Mocking**: `vi.mock` for Supabase client, MSW for HTTP (OpenAI calls in API routes)

---

## Test Coverage Priorities

### Critical (must test)

| Area | What to test |
|------|-------------|
| Auth guards | Unauthenticated requests to protected routes return 401/redirect |
| Role guards | Wrong-role users redirected to their correct home |
| Child onboarding | Display name uniqueness; dino selection saves; `onboarding_complete` set to true |
| Practice flow | Case-insensitive answer check; `timeTakenMs` tracked; session POST fires on last word |
| `/api/sessions/complete` | Correct coin award; `child_stats` upserted; leaderboard stats upserted; RLS bypass via service role |
| `/api/shop/purchase` | Insufficient coins rejected (400); coins deducted; item added to `child_inventory` |
| `/api/words/generate-content` | Definition does not contain target word; audio URL saved to `spelling_words` |
| RLS policies | Children cannot read other children's rows; clients cannot write `coin_balance` directly |
| Leaderboard opt-out | Opted-out children excluded from all leaderboard stat tables |

### Important

| Area | What to test |
|------|-------------|
| Shop UI | Buy button disabled when coins insufficient; confirmation modal shown |
| Wardrobe | Equip/unequip updates avatar preview; loadout saved |
| Results screen | Star rating thresholds (100%=3, 70–99%=2, <70%=1); coin animation triggers |
| Set editor (teacher) | Add word triggers AI generation; word appears in list |
| Migration idempotency | Running migrations twice does not error |

---

## Local Supabase Test Setup

Tests run against the local Supabase stack — never against the dev or prod Supabase projects.

### `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
```

### `src/__tests__/setup.ts`

```typescript
import "@testing-library/jest-dom";

// Set env vars pointing to local Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "<local-anon-key>";
process.env.SUPABASE_SERVICE_ROLE_KEY = "<local-service-role-key>";
process.env.OPENAI_API_KEY = "test-key";
```

### Starting the local stack before tests

```bash
# In CI (GitHub Actions) — handled by supabase/setup-cli action
# Locally:
npm run db:start   # supabase start
npm run test       # vitest run
```

---

## RLS Policy Tests

Test security rules using the Supabase JS client with different auth contexts:

```typescript
// src/__tests__/rls/users.test.ts
import { createClient } from "@supabase/supabase-js";

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe("users RLS", () => {
  it("unauthenticated user cannot read users table", async () => {
    const { data, error } = await anonClient.from("users").select("*").limit(1);
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  it("child cannot update another child's coin_balance", async () => {
    // Sign in as child A, try to update child B's row
    const childAClient = createClient(URL, ANON_KEY);
    await childAClient.auth.signInWithPassword({ email: "child-a@test.com", password: "test1234" });

    const { error } = await childAClient
      .from("users")
      .update({ coin_balance: 9999 })
      .eq("id", "child-b-id");

    expect(error).not.toBeNull();
  });
});
```

---

## Unit Tests

### Spelling answer check

```typescript
// src/__tests__/lib/spelling.test.ts
import { checkSpelling } from "@/lib/spelling";

describe("checkSpelling", () => {
  it("is case-insensitive", () => {
    expect(checkSpelling("Elephant", "elephant")).toBe(true);
    expect(checkSpelling("ELEPHANT", "elephant")).toBe(true);
  });
  it("rejects wrong answers", () => {
    expect(checkSpelling("elefant", "elephant")).toBe(false);
  });
  it("trims whitespace", () => {
    expect(checkSpelling("  elephant  ", "elephant")).toBe(true);
  });
});
```

### Coin calculation

```typescript
// src/__tests__/lib/coins.test.ts
import { calculateCoinsEarned } from "@/lib/coins";

describe("calculateCoinsEarned", () => {
  it("awards 10 coins per correct word", () => {
    expect(calculateCoinsEarned(8, 10)).toBe(80);
  });
  it("awards 0 for all wrong", () => {
    expect(calculateCoinsEarned(0, 10)).toBe(0);
  });
});
```

### Star rating

```typescript
// src/__tests__/lib/results.test.ts
import { getStarRating } from "@/lib/results";

describe("getStarRating", () => {
  it("3 stars for 100%", () => expect(getStarRating(10, 10)).toBe(3));
  it("2 stars for 80%",  () => expect(getStarRating(8, 10)).toBe(2));
  it("1 star for 50%",   () => expect(getStarRating(5, 10)).toBe(1));
});
```

---

## API Route Tests

Mock the Supabase service client and OpenAI in API route tests:

```typescript
// src/__tests__/api/sessions.test.ts
import { POST } from "@/app/api/sessions/complete/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(() => ({
    rpc: vi.fn().mockResolvedValue({ data: { coins_earned: 80 }, error: null }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "child-1" } } }) },
  })),
}));

describe("POST /api/sessions/complete", () => {
  it("returns 200 with coins earned", async () => {
    const req = new NextRequest("http://localhost/api/sessions/complete", {
      method: "POST",
      body: JSON.stringify({ setId: "set-1", correctCount: 8, totalWords: 10, timeTakenMs: 45000 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.coinsEarned).toBe(80);
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(createServiceClient().auth.getUser).mockResolvedValueOnce({
      data: { user: null },
    });
    const req = new NextRequest("http://localhost/api/sessions/complete", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
```

---

## Component Tests (React Testing Library)

### Shop — insufficient coins

```typescript
// src/__tests__/components/ShopItemCard.test.tsx
import { render, screen } from "@testing-library/react";
import ShopItemCard from "@/components/shop/ShopItemCard";

const mockItem = { id: "1", name: "Top Hat", price_coins: 100, category: "hat" };

it("disables buy button when coins are insufficient", () => {
  render(<ShopItemCard item={mockItem} childCoins={50} />);
  expect(screen.getByRole("button", { name: /buy/i })).toBeDisabled();
});

it("enables buy button when coins are sufficient", () => {
  render(<ShopItemCard item={mockItem} childCoins={100} />);
  expect(screen.getByRole("button", { name: /buy/i })).toBeEnabled();
});
```

---

## E2E Tests (Playwright)

Run against local Supabase + Next.js dev server.

### `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Auth guard

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("unauthenticated user redirected to login", async ({ page }) => {
  await page.goto("/child");
  await expect(page).toHaveURL("/login");
});

test("teacher accessing /child is redirected to /teacher", async ({ page }) => {
  await loginAsTeacher(page);
  await page.goto("/child");
  await expect(page).toHaveURL("/teacher");
});
```

### Child practice flow

```typescript
// e2e/practice.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsChild, seedTestSet } from "./helpers";

test("child completes a spelling session", async ({ page }) => {
  await seedTestSet(["cat", "dog", "fish"]);
  await loginAsChild(page, "test-child");

  await page.goto("/child/sets");
  await page.click("text=Test Set");
  await expect(page).toHaveURL(/\/child\/practice\//);

  for (const word of ["cat", "dog", "fish"]) {
    await page.fill('[data-testid="spelling-input"]', word);
    await page.click('[data-testid="submit-btn"]');
  }

  await expect(page).toHaveURL(/\/child\/results\//);
  await expect(page.locator('[data-testid="star-rating"]')).toBeVisible();
  await expect(page.locator('[data-testid="coins-earned"]')).toBeVisible();
});
```

### Shop purchase

```typescript
// e2e/shop.spec.ts
test("child can purchase an item they can afford", async ({ page }) => {
  await loginAsChild(page, "rich-child"); // seeded with 500 coins
  await page.goto("/child/shop");
  await page.click('[data-testid="item-card-hat-001"] button');
  await expect(page.locator('[data-testid="confirm-modal"]')).toBeVisible();
  await page.click('[data-testid="confirm-purchase"]');
  await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible();
});
```

---

## Test File Structure

```
src/
└── __tests__/
    ├── setup.ts
    ├── lib/
    │   ├── spelling.test.ts
    │   ├── coins.test.ts
    │   └── results.test.ts
    ├── api/
    │   ├── sessions.test.ts
    │   ├── shop.test.ts
    │   └── words.test.ts
    ├── components/
    │   ├── ShopItemCard.test.tsx
    │   └── PracticeFlow.test.tsx
    └── rls/
        ├── users.test.ts
        └── coins.test.ts
e2e/
├── helpers.ts
├── auth.spec.ts
├── practice.spec.ts
└── shop.spec.ts
```

---

## Feedback Loop — How to Report Issues to FE/BE Agents

When you find issues, route them to the correct agent:

### Step 1 — Run the health check
```bash
npm run check:report   # runs tsc + lint + vitest, writes test-report.md
```

### Step 2 — Read the categorised report
The script classifies each failure by file path:
- Files under `src/app/api/`, `src/lib/supabase/`, `supabase/` → **Backend (BE)**
- Files under `src/app/` (pages), `src/components/`, `src/hooks/` → **Frontend (FE)**

### Step 3 — Hand off to the right agent

**For FE issues** — paste the `## Frontend (FE) Issues` section into the Frontend agent:
> "The tester found these FE issues — please fix: [paste section]"

**For BE issues** — paste the `## Backend (BE) Issues` section into the Backend agent:
> "The tester found these BE issues — please fix: [paste section]"

**For unknown/cross-cutting issues** — bring to the orchestrator (root CLAUDE.md).

### Step 4 — Re-run after fixes
```bash
npm run check   # confirm all green before marking done
```

### Quick checks (run individually)
```bash
npx tsc --noEmit                  # type errors only
npx next lint                     # lint only
npx vitest run                    # unit tests only
npx playwright test               # E2E only (needs dev server + local Supabase)
```

---

## Working Conventions

- Unit and integration tests run against local Supabase — never dev or prod.
- Mock OpenAI calls with `vi.mock` or MSW — never make real API calls in tests.
- Add `data-testid` to all key interactive elements during component development.
- Seed test data in `supabase/seed.sql` (dev) and in E2E `helpers.ts` (E2E tests).
- CI runs `supabase start` → `npm run test` → `playwright test` before any deploy.
- E2E tests run with `npm run db:reset` first to ensure a clean state.
- Keep test data isolated: each E2E test seeds its own data or uses dedicated test accounts.
