import type { AuthCopy } from "@/lib/launch-copy";

/**
 * Map common Supabase Auth error messages to localized copy where possible.
 */
export function mapSupabaseAuthError(raw: string | undefined, copy: AuthCopy): string {
  if (!raw) return copy.loginFailed;
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return copy.invalidCredentials;
  }
  if (lower.includes("email not confirmed") || lower.includes("email address not confirmed")) {
    return copy.emailNotConfirmed;
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return copy.signupEmailRegistered;
  }
  if (lower.includes("password should be at least") || lower.includes("password is too short")) {
    return copy.passwordTooShort;
  }
  return raw;
}
