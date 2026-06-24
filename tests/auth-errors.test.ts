import { describe, it, expect } from "vitest";

import { mapSupabaseAuthError } from "@/lib/auth-errors";
import type { AuthCopy } from "@/lib/launch-copy";

// Only the fields this mapper reads; cast keeps the test focused.
const copy = {
  loginFailed: "FAILED",
  invalidCredentials: "INVALID",
  emailNotConfirmed: "UNCONFIRMED",
  signupEmailRegistered: "REGISTERED",
  passwordTooShort: "SHORT"
} as unknown as AuthCopy;

describe("mapSupabaseAuthError", () => {
  it("falls back to the generic message for empty input", () => {
    expect(mapSupabaseAuthError(undefined, copy)).toBe("FAILED");
    expect(mapSupabaseAuthError("", copy)).toBe("FAILED");
  });

  it("maps the common auth errors to localized copy (case-insensitive)", () => {
    expect(mapSupabaseAuthError("Invalid login credentials", copy)).toBe("INVALID");
    expect(mapSupabaseAuthError("INVALID LOGIN CREDENTIALS", copy)).toBe("INVALID");
    expect(mapSupabaseAuthError("Email not confirmed", copy)).toBe("UNCONFIRMED");
    expect(mapSupabaseAuthError("User already registered", copy)).toBe("REGISTERED");
    expect(mapSupabaseAuthError("Password should be at least 6 characters", copy)).toBe("SHORT");
  });

  it("returns a non-empty string for unmapped errors", () => {
    const out = mapSupabaseAuthError("some unexpected backend error", copy);
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});
