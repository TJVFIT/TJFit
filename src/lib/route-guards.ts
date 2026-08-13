export type GuardKind = "admin" | "coach_area" | "auth_user" | "coach_terms";

/**
 * Single source of truth for auth-guarded URL families (WP-SEC-05).
 *
 * Consumed by BOTH `src/middleware.ts` (matchHtmlGuard) and `src/app/robots.ts`
 * (crawler disallow list). Before this module the two lists were maintained by
 * hand and had drifted: robots was missing /blog/write entirely.
 *
 * `exact: true` guards match only the exact path (no sub-paths) — currently
 * just /coach/terms, whose sub-paths do not exist.
 *
 * Order matters only for readability (all overlapping prefixes map to the
 * same kind), but keep more-specific prefixes before their parents anyway.
 */
export const MIDDLEWARE_GUARDS: ReadonlyArray<{
  prefix: string;
  kind: GuardKind;
  exact?: boolean;
}> = [
  { prefix: "/admin", kind: "admin" },
  { prefix: "/coach/terms", kind: "coach_terms", exact: true },
  { prefix: "/coach-dashboard", kind: "coach_area" },
  { prefix: "/dashboard", kind: "auth_user" },
  { prefix: "/messages", kind: "auth_user" },
  { prefix: "/feed", kind: "auth_user" },
  { prefix: "/blog/write", kind: "auth_user" },
  { prefix: "/profile/edit", kind: "auth_user" },
  { prefix: "/settings/profile", kind: "auth_user" },
  { prefix: "/checkout", kind: "auth_user" },
  { prefix: "/purchase", kind: "auth_user" },
  { prefix: "/payment", kind: "auth_user" },
  { prefix: "/progress", kind: "auth_user" },
  { prefix: "/settings", kind: "auth_user" }
];

/**
 * Paths that are auth-gated at PAGE level only (no middleware guard — each
 * page does its own requireAuthenticatedUser/redirect) or are auth utility
 * pages. Crawlers still shouldn't spend budget on them.
 * /ai covers /ai/memory by prefix. /tjai stays indexable — it is the public
 * marketing landing.
 */
export const ROBOTS_ONLY_DISALLOW: ReadonlyArray<string> = [
  "/ai",
  "/verify-email",
  "/forgot-password",
  "/reset-password"
];

/** The complete per-locale disallow list robots.ts renders as `/*<path>`. */
export const ROBOTS_DISALLOW_FAMILIES: ReadonlyArray<string> = [
  ...MIDDLEWARE_GUARDS.map((g) => g.prefix),
  ...ROBOTS_ONLY_DISALLOW
];
