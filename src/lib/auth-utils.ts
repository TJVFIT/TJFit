/**
 * Server-side only. Never expose these to the client.
 */

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function getAdminEmailForUsername(username: string): string | null {
  const raw = process.env.ADMIN_CREDENTIALS ?? "";
  const pairs = raw.split(",").map((p) => p.trim()).filter(Boolean);
  for (const pair of pairs) {
    const [u, e] = pair.split(":").map((s) => s?.trim() ?? "");
    if (u && e && u.toLowerCase() === username.toLowerCase()) return e;
  }
  return null;
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}
