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

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}
