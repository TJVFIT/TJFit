import { BUNDLES } from "@/lib/bundles";
import { searchNormalize } from "@/lib/turkish-chars";

export type SearchHit = { id: string; title: string; href: string };

/**
 * Bundles are the only real product on TJFit (programs/diets are static
 * placeholder catalogs, see src/lib/content.ts and src/lib/diets/index.ts —
 * both permanently empty since the May 2026 honesty pass). This is the one
 * "programs"-shaped result group the search UI is allowed to show, and it
 * is sourced from the live bundle registry, not a dead static array.
 */
export function searchBundles(query: string, limit = 6): SearchHit[] {
  const q = searchNormalize(query);
  if (q.length < 2) return [];
  return BUNDLES.filter((b) =>
    searchNormalize(`${b.name} ${b.hook} ${b.goalLabel} ${b.programTitle} ${b.dietTitle}`).includes(q)
  )
    .slice(0, limit)
    .map((b) => ({ id: b.slug, title: b.name, href: `/bundles/${b.slug}` }));
}
