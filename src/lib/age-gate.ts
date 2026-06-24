/**
 * Whole years from a birth date string (ISO or anything `Date` parses).
 * Returns null for empty or invalid input.
 *
 * Powers the COPPA under-13 signup gate, so the "birthday hasn't occurred yet
 * this year" adjustment is load-bearing — a regression here could let an
 * under-13 account through (FTC exposure) or wrongly block a 13-year-old.
 */
export function ageFromBirthDate(value: string): number | null {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}
