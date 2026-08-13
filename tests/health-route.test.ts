import { describe, it, expect, afterEach } from "vitest";

import { GET } from "@/app/api/health/route";

// WP-INFRA-12: /api/health surfaces Resend send-capability so the missing
// RESEND_API_KEY is visible in monitoring instead of silently breaking email.

const ORIGINAL_RESEND_KEY = process.env.RESEND_API_KEY;

afterEach(() => {
  if (ORIGINAL_RESEND_KEY === undefined) {
    delete process.env.RESEND_API_KEY;
  } else {
    process.env.RESEND_API_KEY = ORIGINAL_RESEND_KEY;
  }
});

describe("GET /api/health", () => {
  it('reports email: "unconfigured" when RESEND_API_KEY is absent', async () => {
    delete process.env.RESEND_API_KEY;
    const res = await GET();
    const body = await res.json();
    expect(body.email).toBe("unconfigured");
  });

  it('reports email: "ok" when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = "re_test_dummy_key";
    const res = await GET();
    const body = await res.json();
    expect(body.email).toBe("ok");
  });

  it("email state never flips the liveness verdict (db drives ok/status)", async () => {
    delete process.env.RESEND_API_KEY;
    const res = await GET();
    const body = await res.json();
    // In the test env Supabase env vars are absent → db "unconfigured" → 503.
    // The point pinned here: `ok` tracks db alone, email is informational.
    expect(body.ok).toBe(body.db === "up");
    expect([200, 503]).toContain(res.status);
  });
});
