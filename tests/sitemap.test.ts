import { describe, it, expect, vi, beforeAll } from "vitest";

const h = vi.hoisted(() => ({
  coachRows: [{ username: "coach-jane" }, { username: "coach.ali" }] as Array<{
    username: string | null;
  }> | null,
  postRows: [{ id: "11111111-2222-3333-4444-555555555555" }] as Array<{ id: string }> | null
}));

// The sitemap's dynamic half reads coaches + published posts through the
// service client; mock it so tests stay hermetic (and cover the degraded
// no-DB path via null override).
const mockSupabase = vi.hoisted(() => ({
  from: (table: string) => {
    const rows = table === "profiles" ? h.coachRows : h.postRows;
    const query: any = {
      select: () => query,
      eq: () => query,
      not: () => query,
      order: () => query,
      limit: () => Promise.resolve({ data: rows, error: null })
    };
    return query;
  }
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(() => mockSupabase)
}));

import { BUNDLES } from "@/lib/bundles";
import { locales } from "@/lib/i18n";
import sitemap from "@/app/sitemap";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tjfit.org";
});

describe("sitemap()", () => {
  it("emits the root, every locale landing, and every locale × bundle URL", async () => {
    const entries = await sitemap();
    const urls = new Set(entries.map((e) => e.url));

    // Root + every locale landing.
    expect(urls.has("https://tjfit.org/")).toBe(true);
    for (const loc of locales) {
      expect(urls.has(`https://tjfit.org/${loc}`)).toBe(true);
      expect(urls.has(`https://tjfit.org/${loc}/bundles`)).toBe(true);
    }

    // Every bundle × every locale = 60 detail URLs.
    for (const loc of locales) {
      for (const b of BUNDLES) {
        expect(urls.has(`https://tjfit.org/${loc}/bundles/${b.slug}`)).toBe(true);
      }
    }
  });

  it("covers the four WP-SEO-01 static additions in every locale", async () => {
    const urls = new Set((await sitemap()).map((e) => e.url));
    for (const loc of locales) {
      for (const path of ["press", "leaderboard", "equipment", "start"]) {
        expect(urls.has(`https://tjfit.org/${loc}/${path}`)).toBe(true);
      }
    }
  });

  it("emits coach profile and published blog post URLs per locale", async () => {
    const urls = new Set((await sitemap()).map((e) => e.url));
    for (const loc of locales) {
      expect(urls.has(`https://tjfit.org/${loc}/coaches/coach-jane`)).toBe(true);
      expect(urls.has(`https://tjfit.org/${loc}/coaches/coach.ali`)).toBe(true);
      expect(
        urls.has(`https://tjfit.org/${loc}/blog/11111111-2222-3333-4444-555555555555`)
      ).toBe(true);
    }
  });

  it("degrades to the static sitemap when the DB is unavailable", async () => {
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const spy = vi.mocked(getSupabaseServerClient).mockReturnValueOnce(null as any);
    const entries = await sitemap();
    const urls = new Set(entries.map((e) => e.url));
    expect(urls.has("https://tjfit.org/en/bundles")).toBe(true);
    expect([...urls].some((u) => u.includes("/coaches/coach-jane"))).toBe(false);
    spy.mockClear();
  });

  it("does NOT emit any legacy /programs or /diets ROUTE (segment-precise, not substring)", async () => {
    // A coach username like "programs_coach" legitimately yields
    // /coaches/programs_coach — a naive substring check would false-positive
    // on it. Match the legacy routes as a real path segment right after the
    // locale instead.
    const legacyRoute = /\/(en|tr|ar|es|fr)\/(programs|diets)(\/|$)/;
    const legacy = (await sitemap()).filter((e) => legacyRoute.test(new URL(e.url).pathname));
    expect(legacy).toEqual([]);
  });

  it("each entry has a lastModified, priority, and changeFrequency", async () => {
    for (const entry of await sitemap()) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(typeof entry.priority).toBe("number");
      expect(typeof entry.changeFrequency).toBe("string");
    }
  });

  it("root and locale landings get priority 1; bundle detail pages get lower priority than the index", async () => {
    const entries = await sitemap();
    const root = entries.find((e) => e.url === "https://tjfit.org/")!;
    const index = entries.find((e) => e.url === "https://tjfit.org/en/bundles")!;
    const detail = entries.find((e) => e.url.endsWith("/en/bundles/fat-loss"))!;

    expect(root.priority).toBe(1);
    expect(index.priority).toBe(0.7);
    expect(detail.priority).toBeLessThan(index.priority!);
  });
});
