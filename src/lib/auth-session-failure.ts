/** Classify getUser failures without reading, logging or returning provider messages. */
const signedOutCodes = new Set([
  "bad_jwt", "no_authorization", "user_not_found", "user_banned",
  "session_not_found", "session_expired", "refresh_token_not_found", "refresh_token_already_used"
]);

export const AUTH_SERVICE_UNAVAILABLE = "AUTH_SERVICE_UNAVAILABLE";

export function classifyAuthSessionFailure(error: unknown): "signed_out" | "unavailable" {
  if (!error || typeof error !== "object") return "unavailable";
  const failure = error as { name?: unknown; code?: unknown; status?: unknown };
  const status = typeof failure.status === "number" ? failure.status : undefined;
  // Service failures take precedence even if an intermediary repeats a session code.
  if (status === 402 || status === 408 || status === 429 || (status !== undefined && status >= 500)) return "unavailable";
  if (failure.name === "AuthRetryableFetchError" || failure.name === "AuthUnknownError") return "unavailable";
  if (failure.name === "AuthSessionMissingError") return "signed_out";
  if (typeof failure.code === "string" && signedOutCodes.has(failure.code)) return "signed_out";
  // Unknown failures (including malformed provider responses) are not proof of logout.
  return "unavailable";
}
