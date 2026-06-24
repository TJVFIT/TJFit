import { describe, it, expect } from "vitest";

import { ageFromBirthDate } from "@/lib/age-gate";

/** A DOB string for someone whose birthday is `dayOffset` days from today, `years` ago. */
function dob(years: number, dayOffset = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

// Mirrors the signup gate: allowed iff a real age >= 13.
const meetsMinAge = (v: string) => {
  const a = ageFromBirthDate(v);
  return a !== null && a >= 13;
};

describe("ageFromBirthDate — COPPA under-13 gate", () => {
  it("allows someone who turns 13 today", () => {
    expect(meetsMinAge(dob(13, 0))).toBe(true);
  });

  it("blocks someone whose 13th birthday is tomorrow (birthday-not-passed case)", () => {
    // The load-bearing branch: same/earlier calendar position must subtract a year.
    expect(meetsMinAge(dob(13, 1))).toBe(false);
  });

  it("allows someone who turned 13 yesterday", () => {
    expect(meetsMinAge(dob(13, -1))).toBe(true);
  });

  it("blocks a clearly under-13 child", () => {
    expect(meetsMinAge(dob(8))).toBe(false);
  });

  it("allows a clear adult", () => {
    const a = ageFromBirthDate("1990-01-01");
    expect(a).not.toBeNull();
    expect(a as number).toBeGreaterThanOrEqual(18);
  });

  it("returns null for empty / unparseable input (gate stays closed)", () => {
    expect(ageFromBirthDate("")).toBeNull();
    expect(ageFromBirthDate("not-a-date")).toBeNull();
    expect(meetsMinAge("")).toBe(false);
  });
});
