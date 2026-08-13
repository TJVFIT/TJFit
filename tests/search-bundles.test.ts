import { describe, it, expect } from "vitest";

import { searchBundles } from "@/lib/search-bundles";

/**
 * Bundles are the only real product on TJFit. The global search route used
 * to have "programs" and "diets" result groups wired to permanently-empty
 * static arrays (src/lib/content.ts, src/lib/diets/index.ts) left over from
 * the May 2026 honesty pass — those groups could never return a result no
 * matter what a user typed. searchBundles() is the live replacement; pin
 * its behavior so search stays honest.
 */
describe("searchBundles", () => {
  it("surfaces the fat-loss bundle for a fat-loss query", () => {
    const hits = searchBundles("fat loss");
    expect(hits.some((h) => h.id === "fat-loss")).toBe(true);
  });

  it("returns a well-formed hit shape pointing at the bundle detail page", () => {
    const hits = searchBundles("fat loss");
    const hit = hits.find((h) => h.id === "fat-loss");
    expect(hit).toEqual({ id: "fat-loss", title: "Fat Loss Bundle", href: "/bundles/fat-loss" });
  });

  it("matches on goal label as well as name", () => {
    const hits = searchBundles("bulk");
    expect(hits.some((h) => h.id === "lean-bulk")).toBe(true);
  });

  it("is diacritic/Turkish-char insensitive like the rest of search", () => {
    const plain = searchBundles("powerbuilding");
    const withTurkishChars = searchBundles("pöwerbuilding");
    expect(plain.map((h) => h.id)).toEqual(withTurkishChars.map((h) => h.id));
    expect(plain.some((h) => h.id === "powerbuilding")).toBe(true);
  });

  it("returns no results for a query shorter than 2 characters", () => {
    expect(searchBundles("f")).toEqual([]);
    expect(searchBundles("")).toEqual([]);
  });

  it("returns no results for a query that matches nothing", () => {
    expect(searchBundles("zzzznonexistentqueryzzzz")).toEqual([]);
  });

  it("respects the limit parameter", () => {
    // A broad query ("bundle" appears nowhere in the corpus, so use a term
    // common across many bundles' hook text instead).
    const hits = searchBundles("week", 2);
    expect(hits.length).toBeLessThanOrEqual(2);
  });
});
