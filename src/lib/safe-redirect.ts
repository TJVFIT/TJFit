/**
 * Validates post-auth redirects: same-origin path under /[locale]/ only.
 * Blocks open redirects, //, and /api/.
 */
export function isSafeRedirect(path: string, locale: string): boolean {
  if (!path || typeof path !== "string") return false;
  const decoded = path.trim();
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return false;
  if (decoded.includes("//")) return false;
  const lower = decoded.toLowerCase();
  if (lower.startsWith("/api/") || lower.includes("/api/")) return false;
  if (decoded !== `/${locale}` && !decoded.startsWith(`/${locale}/`)) return false;
  return true;
}

export function sanitizeRedirectParam(raw: string | null | undefined, locale: string): string | null {
  if (raw == null || raw === "") return null;
  try {
    const decoded = decodeURIComponent(String(raw).trim());
    return isSafeRedirect(decoded, locale) ? decoded : null;
  } catch {
    return null;
  }
}
