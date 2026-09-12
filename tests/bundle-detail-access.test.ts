import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { locales } from "@/lib/i18n";
import { bundleInsideStats } from "@/lib/bundle-insights";
import { getBundlesCopy } from "@/lib/bundles-copy";
import { localizeBundle } from "@/lib/bundle-localization";
import { getBundle } from "@/lib/bundles";

const h = vi.hoisted(() => ({
  user: null as null | { id: string; email: string },
  owned: false,
  hasPurchased: vi.fn(async () => false)
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: h.user } }) } })
}));
vi.mock("@/lib/supabase-server", () => ({ getSupabaseServerClient: () => ({ serviceRole: true }) }));
vi.mock("@/lib/purchases", () => ({ hasPurchasedProgram: h.hasPurchased }));
vi.mock("@/lib/auth-utils", () => ({ isAdminEmail: () => false }));

import BundleDetailPage from "@/app/[locale]/bundles/[slug]/page";
import { InsideStatTiles } from "@/app/[locale]/bundles/[slug]/detail-effects";

beforeEach(() => {
  h.user = null;
  h.owned = false;
  h.hasPurchased.mockReset().mockImplementation(async () => h.owned);
});

describe("bundle detail access messaging", () => {
  it.each(locales)("%s: anonymous visitors see options without a program activation link", async (locale) => {
    const html = renderToStaticMarkup(await BundleDetailPage({ params: Promise.resolve({ locale, slug: "home-starter" }) }));
    const copy = getBundlesCopy(locale).detail;
    expect(html).toContain(copy.accessTitle);
    expect(html).not.toContain(copy.readyTitle);
    expect(html).toContain('href="#cta"');
    expect(html).toContain(`aria-label="${copy.sectionNavAria}"`);
    expect(html).not.toContain(`href="/${locale}/bundles/home-starter/program"`);
    expect(h.hasPurchased).not.toHaveBeenCalled();
  });

  it("a signed-in non-owner cannot activate a program from the detail page", async () => {
    h.user = { id: "verified-user", email: "customer@example.com" };
    const html = renderToStaticMarkup(await BundleDetailPage({ params: Promise.resolve({ locale: "en", slug: "home-starter" }) }));
    expect(html).not.toContain('href="/en/bundles/home-starter/program"');
    expect(html).toContain("Review availability and sign-in options.");
    expect(h.hasPurchased).toHaveBeenCalledWith({ serviceRole: true }, h.user.id, "home-starter");
  });

  it.each(locales)("%s: an existing owner retains localized start links and download wording", async (locale) => {
    h.user = { id: "verified-owner", email: "customer@example.com" };
    h.owned = true;
    const html = renderToStaticMarkup(await BundleDetailPage({ params: Promise.resolve({ locale, slug: "home-starter" }) }));
    const copy = getBundlesCopy(locale).detail;
    const name = localizeBundle(getBundle("home-starter")!, locale).name;
    const text = (value: string) => renderToStaticMarkup(createElement("span", null, value)).slice(6, -7);
    expect(html).toContain(`href="/${locale}/bundles/home-starter/program"`);
    expect(html).toContain(text(copy.readyTitle));
    expect(html).toContain(text(copy.startProgram));
    expect(html).toContain(text(copy.startProgramAria(name)));
    expect(html).not.toContain(text(copy.accessTitle));
    if (locale !== "en") expect(html).not.toContain("Start Program");
  });
});

describe("bundle counts before hydration or animation", () => {
  it("renders actual final values for assistive technology and hides animated duplicates", () => {
    const facts = bundleInsideStats("home-starter");
    const stats = Object.entries(facts).map(([label, value]) => ({ label, value }));
    const html = renderToStaticMarkup(createElement(InsideStatTiles, { stats }));
    const accessibleCounts = [...html.matchAll(/<span class="sr-only">(\d+)<\/span>/g)].map(match => Number(match[1]));
    expect(accessibleCounts).toEqual(stats.map(stat => stat.value));
    expect(accessibleCounts.every(count => count > 0)).toBe(true);
    expect([...html.matchAll(/<span aria-hidden="true">(\d+)<\/span>/g)].map(match => Number(match[1]))).toEqual(accessibleCounts);
  });
});
