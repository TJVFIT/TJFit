import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Account-level privacy gate (2026-08-13 privacy fix).
 *
 * `profiles.is_private` is a user-facing toggle (profile-edit-form) that the
 * follow/profile APIs historically ignored — any authenticated user could
 * page through a private account's follower list, and anonymous visitors got
 * the full bio/streak/badges/posts. This helper is the single check both
 * follow-list routes use; the profile route inlines the same rule because it
 * already holds the row.
 *
 * Rule: a private profile's details and social graph are visible only to the
 * owner. (No follow-request/approved-follower system exists yet — when one
 * lands, approved followers join this check.) Counts stay public, matching
 * the established social-network convention for private accounts.
 */
export async function isProfilePrivateToViewer(
  admin: SupabaseClient,
  targetUserId: string,
  viewerId: string | null
): Promise<boolean> {
  if (viewerId && viewerId === targetUserId) return false;
  const { data } = await admin
    .from("profiles")
    .select("is_private")
    .eq("id", targetUserId)
    .maybeSingle();
  return Boolean(data?.is_private);
}
