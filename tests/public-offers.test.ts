import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { locales } from "@/lib/i18n";
import { PUBLIC_COPY, PUBLIC_OFFERS, publicPrimaryLinks, tjaiIntakeHref } from "@/lib/public-offers-copy";

vi.mock("@/components/auth-provider", () => ({ useAuth: () => ({ user: null, role: null }) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/tr/tjai", useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));

import { PublicHome } from "@/components/public-home";
import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { SiteTopBar } from "@/components/shell/site-top-bar";
import { SiteSideOverlay } from "@/components/shell/site-side-overlay";
import { buildShellOverlayNav } from "@/lib/shell-overlay-nav";
import ProPage from "@/app/[locale]/pro/page";
import MembershipPage from "@/app/[locale]/membership/page";
import CreditsPage from "@/app/[locale]/tjai/credits/page";

function links(html: string) { return Array.from(html.matchAll(/href="([^"]+)"/g), (match) => match[1].replaceAll("&amp;", "&")); }

describe("public offer journey in every supported locale", () => {
  it("publishes the approved pass and paid bundle terms", () => {
    expect(PUBLIC_OFFERS).toEqual({ tjaiUsd: 19.99, bundleUsd: 10, chatRepliesPerDay: 5, regenerationsPerMonth: 1 });
    expect(Object.keys(PUBLIC_COPY).sort()).toEqual([...locales].sort());
  });

  for (const locale of locales) {
    it(`${locale}: homepage offers all three paths and sends TJAI to intake`, () => {
      const html = renderToStaticMarkup(createElement(PublicHome, { locale }));
      expect(links(html)).toEqual(expect.arrayContaining([`/${locale}/bundles`, tjaiIntakeHref(locale), `/${locale}/store`]));
      expect([...html.matchAll(/data-offer="([^"]+)"/g)].map((match) => match[1])).toEqual(["bundles", "tjai", "equipment"]);
      expect(html).toContain(PUBLIC_COPY[locale].bundles.detail);
      expect(html).toContain(PUBLIC_COPY[locale].tjai.detail);
      expect(html).not.toMatch(/testimonial|reviewCount|aggregateRating|4\.9|10,000/i);
    });

    it(`${locale}: pass offer has one price, explicit limits, intake and existing access`, () => {
      const html = renderToStaticMarkup(createElement(TjaiPublicLanding, { locale }));
      expect(html).toContain("19.99");
      expect(html).not.toMatch(/\$8\b|\$10\b|Apex|Pro \/|gumroad|\/checkout/i);
      expect(links(html)).toEqual(expect.arrayContaining([tjaiIntakeHref(locale), `/${locale}/ai`, `/${locale}/support`]));
      for (const feature of PUBLIC_COPY[locale].features) {
        const text = renderToStaticMarkup(createElement("span", {}, feature));
        expect(html).toContain(text.slice(6, -7));
      }
    });

    it(`${locale}: navigation preserves all product routes without an automatic modal`, () => {
      const html = renderToStaticMarkup(createElement(SiteTopBar, { locale }));
      for (const item of publicPrimaryLinks(locale)) expect(links(html)).toContain(item.href);
      expect(links(html)).toContain(`/${locale}/login?redirect=%2Ftr%2Ftjai`);
      expect(html).toContain('aria-haspopup="listbox"');
      const drawer = renderToStaticMarkup(createElement(SiteSideOverlay, { locale }));
      expect(drawer).not.toContain('role="dialog"');
      expect(drawer).toContain('aria-expanded="false"');
      expect(buildShellOverlayNav(locale, locale).groups[0].items.slice(0, 3).map((item) => item.href)).toEqual(publicPrimaryLinks(locale).map((item) => item.href));
    });

    for (const [name, Page] of [["pro", ProPage], ["membership", MembershipPage], ["credits", CreditsPage]] as const) {
      it(`${locale}: legacy ${name} entry offers the pass without another payment path`, async () => {
        const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale }) }));
        expect(links(html)).toContain(tjaiIntakeHref(locale));
        expect(links(html).every((href) => href.startsWith(`/${locale}/`))).toBe(true);
        expect(html).not.toMatch(/gumroad|Apex|\/checkout|credit packs/i);
        expect(html).toContain("19.99");
      });
    }
  }
});
