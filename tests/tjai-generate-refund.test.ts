/**
 * TJAI generate route — credit refund safety.
 *
 * Verifies the try/finally refund flow added in `a526f7c`:
 *   - Refund FIRES when the pipeline returns { ok: false }
 *   - Refund FIRES when an uncaught exception is thrown mid-pipeline
 *   - Refund FIRES on 4xx early-returns after credit consume (e.g. invalid payload)
 *   - Refund DOES NOT FIRE on successful delivery
 *   - Refund DOES NOT double-fire (idempotency guard)
 *
 * Note: a true Vercel-timeout is impossible to simulate in a unit test
 * because it's an external process kill. Throwing mid-await is the
 * closest behavioral proxy and exercises the same finally code path.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock factories (declared before route import so vi.mock hoists correctly) ----

const mockRpc = vi.fn();
const mockFromBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null }),
  insert: vi.fn().mockResolvedValue({ data: null, error: null })
});

const mockAdminClient = {
  from: vi.fn(() => mockFromBuilder()),
  rpc: mockRpc
};

vi.mock("@/lib/require-auth", () => ({
  requireAuth: vi.fn(async () => ({
    ok: true,
    user: { id: "user-test-1", email: "test@example.com" }
  }))
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(() => mockAdminClient)
}));

vi.mock("@/lib/auth-utils", () => ({
  isAdminEmail: vi.fn(() => false)
}));

vi.mock("@/lib/tjai-access", () => ({
  getTJAIAccess: vi.fn(() => ({ canGeneratePlan: false, canUseChat: true }))
}));

vi.mock("@/lib/tjai-intake", () => ({
  buildTjaiUserProfile: vi.fn(() => ({ age: 30, weightKg: 75, heightCm: 180 })),
  normalizeQuizAnswers: vi.fn((a: unknown) => a)
}));

vi.mock("@/lib/tjai-science", () => ({
  calculateTJAIMetrics: vi.fn(() => ({}))
}));

const mockRunPipeline = vi.fn();
vi.mock("@/lib/tjai", () => ({
  runPlanGenerationPipeline: mockRunPipeline
}));

// ---- Helpers ----

import type { NextRequest } from "next/server";

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    headers: new Headers()
  } as unknown as NextRequest;
}

function setupCreditConsumeOk() {
  // First rpc call: consume_tjai_credit returns { ok: true, balance_after: 4 }
  // Second rpc call (refund, if any): grant_tjai_credit returns { error: null }
  mockRpc.mockReset();
  mockRpc
    .mockResolvedValueOnce({ data: [{ ok: true, balance_after: 4 }], error: null })
    .mockResolvedValue({ data: null, error: null });
}

function refundCalls() {
  return mockRpc.mock.calls.filter(([name]) => name === "grant_tjai_credit");
}

const VALID_BODY = {
  s1_age: 30,
  s1_weight: 75,
  s1_height: 180,
  s2_pace: "moderate"
};

describe("TJAI generate route — refund safety", () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockRunPipeline.mockReset();
  });

  it("refunds when the pipeline returns { ok: false }", async () => {
    setupCreditConsumeOk();
    mockRunPipeline.mockResolvedValueOnce({
      ok: false,
      error: "fake_pipeline_failure",
      status: 500,
      trace: { errors: ["mock"] }
    });

    const { POST } = await import("@/app/api/tjai/generate/route");
    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(500);
    const refunds = refundCalls();
    expect(refunds.length).toBe(1);
    expect(refunds[0][1]).toMatchObject({
      p_user_id: "user-test-1",
      p_amount: 1,
      p_reason: "refund"
    });
  });

  it("refunds when the pipeline throws (proxy for Vercel timeout)", async () => {
    setupCreditConsumeOk();
    mockRunPipeline.mockImplementationOnce(async () => {
      throw new Error("simulated_timeout");
    });

    const { POST } = await import("@/app/api/tjai/generate/route");
    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(500);
    expect(refundCalls().length).toBe(1);
  });

  it("refunds on 4xx invalid-payload early return (after credit consumed)", async () => {
    setupCreditConsumeOk();

    const { POST } = await import("@/app/api/tjai/generate/route");
    // Empty body → fails the "Invalid answers payload" 400 path AFTER consume.
    const res = await POST(makeRequest(null));

    expect(res.status).toBe(400);
    expect(refundCalls().length).toBe(1);
  });

  it("does NOT refund on successful delivery", async () => {
    setupCreditConsumeOk();
    mockRunPipeline.mockResolvedValueOnce({
      ok: true,
      body: { plan: "ok" },
      status: 200
    });

    const { POST } = await import("@/app/api/tjai/generate/route");
    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(200);
    expect(refundCalls().length).toBe(0);
  });

  it("does not double-refund if finally block is somehow re-entered", async () => {
    // The route's `refunded` flag should prevent double-fire under any
    // single invocation. Two sequential failures → two separate refunds
    // (independent invocations); but within ONE invocation only one.
    setupCreditConsumeOk();
    mockRunPipeline.mockResolvedValueOnce({
      ok: false,
      error: "x",
      status: 500,
      trace: { errors: [] }
    });

    const { POST } = await import("@/app/api/tjai/generate/route");
    await POST(makeRequest(VALID_BODY));

    // Single invocation, one refund call.
    expect(refundCalls().length).toBe(1);
  });
});
