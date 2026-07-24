import type { NextRequest } from "next/server";

const MAX_IP_LENGTH = 64;

export function getClientAddress(request: NextRequest) {
  const candidates = [
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0],
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0]
  ];

  const address = candidates
    .map((value) => value?.trim())
    .find((value) => value && value.length <= MAX_IP_LENGTH);

  return address ?? "unknown";
}

/**
 * Reject browser cross-site mutations while still allowing non-browser server
 * clients that do not send Origin/Sec-Fetch-Site.
 */
export function isTrustedMutationRequest(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export function exceedsDeclaredBodySize(request: NextRequest, maxBytes: number) {
  const value = request.headers.get("content-length");
  if (!value) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > maxBytes;
}
