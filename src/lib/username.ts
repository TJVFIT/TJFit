/** Display + stored username: letters, numbers, underscore, dot; 3–20 chars */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{3,20}$/;

/** Keep in sync with reserved list in profiles_username_enforce (Supabase migration). */
export const RESERVED_USERNAMES = [
  "admin",
  "support",
  "tjfit",
  "system",
  "help",
  "api",
  "root",
  "null",
  "undefined",
  "www",
  "mail"
] as const;

const RESERVED = new Set<string>(RESERVED_USERNAMES);

export function isValidUsername(raw: string): boolean {
  const t = raw.trim();
  if (!USERNAME_PATTERN.test(t)) return false;
  if (RESERVED.has(t.toLowerCase())) return false;
  return true;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}
