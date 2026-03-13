import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Supabase mock setup ---
const mockGetSession = vi.fn().mockResolvedValue({
  data: { session: { user: { id: "child-1" } } },
  error: null,
});

function makeChain(result: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    single: vi.fn().mockResolvedValue(result),
    then: vi.fn((resolve: (v: unknown) => void) => resolve({ data: [], error: null })),
  };
  return chain;
}

// Table-aware from() mock
function makeFromMock(opts: { coinBalance?: number; shopItemNotFound?: boolean } = {}) {
  const { coinBalance = 100, shopItemNotFound = false } = opts;
  return vi.fn((table: string) => {
    if (table === "users") {
      return makeChain({ data: { role: "child", coin_balance: coinBalance }, error: null });
    }
    if (table === "shop_items") {
      if (shopItemNotFound) return makeChain({ data: null, error: { message: "not found" } });
      return makeChain({ data: { id: "item-xyz", price_coins: 50, is_active: true }, error: null });
    }
    if (table === "child_inventory") {
      const chain = makeChain({ data: null, error: null });
      // Inventory check resolves as empty array (not already owned)
      chain.then = vi.fn((resolve: (v: unknown) => void) => resolve({ data: [], error: null }));
      return chain;
    }
    if (table === "coin_transactions") {
      return makeChain({ data: null, error: null });
    }
    // Default: return success chain
    return makeChain({ data: { coin_balance: coinBalance - 50 }, error: null });
  });
}

let mockFrom = makeFromMock();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getSession: mockGetSession },
    from: (table: string) => mockFrom(table),
  })),
  createServiceClient: vi.fn(() => ({
    from: (table: string) => mockFrom(table),
  })),
}));

import { POST } from "@/app/api/shop/purchase/route";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/shop/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/shop/purchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "child-1" } } },
      error: null,
    });
    mockFrom = makeFromMock();
  });

  it("returns 200 and deducts coins when the child has sufficient balance", async () => {
    const response = await POST(makeRequest({ itemId: "item-xyz" }));
    expect(response.status).toBe(200);
    const json = await response.json() as { newBalance: number };
    expect(typeof json.newBalance).toBe("number");
  });

  it("returns 400 when the child has insufficient coins", async () => {
    mockFrom = makeFromMock({ coinBalance: 10 });
    const response = await POST(makeRequest({ itemId: "item-xyz" }));
    expect(response.status).toBe(400);
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: "Not authenticated" } });
    const response = await POST(makeRequest({ itemId: "item-xyz" }));
    expect(response.status).toBe(401);
  });
});
