import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Supabase mock setup ---
const mockRpc = vi.fn().mockResolvedValue({
  data: { session_id: "sess-1", coins_earned: 80, new_balance: 180 },
  error: null,
});

const mockGetSession = vi.fn().mockResolvedValue({
  data: { session: { user: { id: "child-1" } } },
  error: null,
});

function makeFromChain(singleResult: unknown = { role: "child" }, listResult: unknown[] = []) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleResult, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: singleResult, error: null }),
    then: vi.fn((resolve: (v: unknown) => void) => resolve({ data: listResult, error: null })),
  };
  return chain;
}

const mockFrom = vi.fn(() => makeFromChain());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getSession: mockGetSession },
    from: mockFrom,
  })),
  createServiceClient: vi.fn(() => ({
    rpc: mockRpc,
    from: mockFrom,
  })),
}));

import { POST } from "@/app/api/sessions/complete/route";

const VALID_SET_ID = "00000000-0000-0000-0000-000000000001";
const BASE_BODY = {
  setId: VALID_SET_ID,
  correctCount: 8,
  totalWords: 10,
  timeTakenMs: 45000,
  wordResults: [],
};

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/sessions/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/sessions/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "child-1" } } },
      error: null,
    });
    mockRpc.mockResolvedValue({
      data: { session_id: "sess-1", coins_earned: 80, new_balance: 180 },
      error: null,
    });
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return makeFromChain({ role: "child" });
      return makeFromChain(null, [{ id: "personal-set-1" }]);
    });
  });

  it("returns 200 with coinsEarned and newBalance for a valid child request", async () => {
    const response = await POST(makeRequest(BASE_BODY));
    expect(response.status).toBe(200);
    const json = await response.json() as { coinsEarned: number; newBalance: number };
    // With empty wordResults: wordCoins=0, perfectBonus=0 (8/10), fastestBonus=5 (first ever)
    expect(json.coinsEarned).toBe(5);
    expect(json.newBalance).toBeDefined();
  });

  it("returns 400 for a request with missing required fields", async () => {
    const response = await POST(makeRequest({ setId: VALID_SET_ID }));
    expect(response.status).toBe(400);
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: "Not authenticated" } });
    const response = await POST(makeRequest(BASE_BODY));
    expect(response.status).toBe(401);
  });

  it("returns 403 when the authenticated user has the teacher role", async () => {
    mockFrom.mockImplementation(() => makeFromChain({ role: "teacher" }));
    const response = await POST(makeRequest(BASE_BODY));
    expect(response.status).toBe(403);
  });
});
