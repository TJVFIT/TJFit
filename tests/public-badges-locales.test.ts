import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { locales, LOCALE_META } from "@/lib/i18n";
import { getBundle } from "@/lib/bundles";
import { getBundlesCopy } from "@/lib/bundles-copy";

vi.mock("next/navigation", () => ({ usePathname: () => "/fr/bundles" }));

import { BundleGrid } from "@/app/[locale]/bundles/bundle-grid";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

describe("public localized price badges and language names", () => {
  it.each(locales)("%s renders the free price label and its accessible equivalent", (locale) => {
    const bundle = getBundle("fat-loss");
    if (!bundle) throw new Error("Missing free bundle fixture");
    const copy = getBundlesCopy(locale);
    const html = renderToStaticMarkup(createElement(BundleGrid, { bundles: [bundle], locale }));
    expect(html).toContain(`aria-label="${copy.priceAria(copy.free)}"`);
    expect(html).toContain(`>${copy.free}</span>`);
    if (locale !== "en") expect(html).not.toContain(">Free</span>");
  });

  it.each(locales)("%s announces its native name while retaining recognizable language choices", (locale) => {
    const html = renderToStaticMarkup(createElement(LanguageSwitcher, { locale }));
    expect(html).toContain(`: ${LOCALE_META[locale].native}"`);
    for (const code of locales) {
      expect(html).toContain(LOCALE_META[code].native);
      expect(html).toContain(LOCALE_META[code].label);
    }
  });

  it("renders a distinct scroll-control label in all five languages", () => {
    const labels = locales.map(locale => renderToStaticMarkup(createElement(ScrollToTop, { locale })).match(/aria-label="([^"]+)"/)?.[1]);
    expect(labels.every(label => typeof label === "string" && label.length > 0)).toBe(true);
    expect(new Set(labels).size).toBe(locales.length);
  });
});
