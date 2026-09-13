/**
 * Validates post-auth redirects: same-origin path under /[locale]/ only.
 * Blocks open redirects, //, and /api/.
 */
export function isSafeRedirect(path: string, locale: string): boolean {
  if (!path || typeof path !== "string" || /[\u0000-\u001f\u007f]/.test(path)) return false;
  const decoded = path.trim();
  if (decoded.length > 4096 || /[\\\u0000-\u001f\u007f]/.test(decoded)) return false;
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return false;
  if (decoded.includes("//")) return false;
  try {
    const url = new URL(decoded, "https://redirect.invalid");
    const pathname = decodeURIComponent(url.pathname);
    if (url.origin !== "https://redirect.invalid" || /[\\\u0000-\u001f\u007f]/.test(pathname)) return false;
    // Reject encoded separators and dot segments instead of allowing routing layers
    // to disagree about which locale or private endpoint receives the redirect.
    if (/%(?:2f|5c)/i.test(url.pathname) || pathname.split("/").some(part => part === "." || part === "..")) return false;
    if (pathname.toLowerCase().split("/").includes("api")) return false;
    return pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);
  } catch { return false; }
}

export function sanitizeRedirectParam(raw: string | null | undefined, locale: string): string | null {
  if (raw == null || raw === "") return null;
  if (/[\u0000-\u001f\u007f]/.test(String(raw))) return null;
  try {
    const value = String(raw).trim();
    // URLSearchParams already removes the outer encoding. Preserve encoding
    // inside an internal path's query (e.g. an ampersand in a search term).
    const decoded = value.startsWith("/") ? value : decodeURIComponent(value);
    return isSafeRedirect(decoded, locale) ? decoded : null;
  } catch {
    return null;
  }
}
