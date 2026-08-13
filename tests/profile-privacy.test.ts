/**
 * Account-level privacy primitives (2026-08-13 privacy fixes). The three-round
 * review saga proved these paths had zero regression protection — the round-3
 * verifier could only validate them by manual replay. These tests make the
 * suite itself the guard.
 */

import { describe, it, expect } from "vitest";

import { isProfilePrivateToViewer, maskPrivateStreak } from "@/lib/profile-privacy";

type MockResult = { data: { is_private: boolean } | null; error: { message: string } | null };

function mockAdmin(result: MockResult) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => result
        })
      })
    })
  } as never;
}

describe("maskPrivateStreak", () => {
  it("nulls the streak and strips is_private for a private row", () => {
    const out = maskPrivateStreak({ id: "u1", current_streak: 42, is_private: true });
    expect(out.current_streak).toBeNull();
    expect("is_private" in out).toBe(false);
    expect(out.id).toBe("u1");
  });

  it("keeps the streak for a public row (is_private false)", () => {
    const out = maskPrivateStreak({ id: "u2", current_streak: 7, is_private: false });
    expect(out.current_streak).toBe(7);
    expect("is_private" in out).toBe(false);
  });

  it("keeps the streak when is_private is null/absent (legacy rows)", () => {
    const out = maskPrivateStreak({ id: "u3", current_streak: 3, is_private: null });
    expect(out.current_streak).toBe(3);
    const out2 = maskPrivateStreak({ id: "u4", current_streak: 5 });
    expect(out2.current_streak).toBe(5);
  });
});

describe("isProfilePrivateToViewer", () => {
  it("owner always sees their own profile (no DB read needed)", async () => {
    const admin = mockAdmin({ data: { is_private: true }, error: null });
    expect(await isProfilePrivateToViewer(admin, "me", "me")).toBe(false);
  });

  it("private profile is private to another viewer", async () => {
    const admin = mockAdmin({ data: { is_private: true }, error: null });
    expect(await isProfilePrivateToViewer(admin, "target", "viewer")).toBe(true);
  });

  it("public profile is not private", async () => {
    const admin = mockAdmin({ data: { is_private: false }, error: null });
    expect(await isProfilePrivateToViewer(admin, "target", "viewer")).toBe(false);
  });

  it("FAILS CLOSED on a DB error — privacy beats availability", async () => {
    const admin = mockAdmin({ data: null, error: { message: "connection reset" } });
    expect(await isProfilePrivateToViewer(admin, "target", "viewer")).toBe(true);
  });

  it("nonexistent target (zero rows, no error) is treated as not-private", async () => {
    const admin = mockAdmin({ data: null, error: null });
    expect(await isProfilePrivateToViewer(admin, "ghost", "viewer")).toBe(false);
  });
});
