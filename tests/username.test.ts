import { describe, it, expect } from "vitest";

import { isValidUsername, normalizeUsername, RESERVED_USERNAMES } from "@/lib/username";

/**
 * Usernames feed public profile URLs and display, so the validation is a
 * security boundary: it must reject injection/path characters and reserved
 * handles, and bound the length. Pins that behavior against regressions.
 */
describe("isValidUsername", () => {
  it("accepts valid handles (letters, numbers, _ and .)", () => {
    expect(isValidUsername("john_doe")).toBe(true);
    expect(isValidUsername("user.name")).toBe(true);
    expect(isValidUsername("abc")).toBe(true); // 3-char minimum
    expect(isValidUsername("a".repeat(20))).toBe(true); // 20-char maximum
  });

  it("rejects out-of-range lengths", () => {
    expect(isValidUsername("ab")).toBe(false); // too short
    expect(isValidUsername("a".repeat(21))).toBe(false); // too long
    expect(isValidUsername("")).toBe(false);
  });

  it("rejects injection / path / whitespace characters", () => {
    expect(isValidUsername("<script>")).toBe(false);
    expect(isValidUsername("a/b")).toBe(false);
    expect(isValidUsername("a b")).toBe(false);
    expect(isValidUsername("a@b.com")).toBe(false);
    expect(isValidUsername("drop;table")).toBe(false);
  });

  it("blocks reserved handles case-insensitively", () => {
    for (const r of RESERVED_USERNAMES) {
      expect(isValidUsername(r)).toBe(false);
      expect(isValidUsername(r.toUpperCase())).toBe(false);
    }
  });
});

describe("normalizeUsername", () => {
  it("trims and lowercases", () => {
    expect(normalizeUsername("  John_Doe  ")).toBe("john_doe");
    expect(normalizeUsername("USER.NAME")).toBe("user.name");
  });
});
