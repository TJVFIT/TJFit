import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PressPage from "@/app/[locale]/press/page";
import { PRESS_COPY } from "@/lib/press-copy";
import { scanSource } from "../scripts/i18n/check-hardcoded-ui";

describe("localized factual press page", () => {
  it.each(["en", "tr", "ar", "es", "fr"] as const)("%s renders resources, the public support address and its locale return link", async (locale) => {
    const html = renderToStaticMarkup(await PressPage({ params: Promise.resolve({ locale }) }));
    expect(html).toContain('href="mailto:tjfit.org@gmail.com"');
    expect(html).toContain(`href="/${locale}"`);
    expect(html).not.toMatch(/50\+|48 hours|Growing daily|certified fitness coaches|press@tjfit\.org|partners@tjfit\.org/);
    expect(Object.keys(PRESS_COPY[locale])).toEqual(Object.keys(PRESS_COPY.en));
    if (locale !== "en") expect(PRESS_COPY[locale].aboutText).not.toBe(PRESS_COPY.en.aboutText);
    for (const href of ["/brand/logo-main.png", "/brand/logo-source.png", "/brand/logo-mark.png", "/og-image.jpg"]) {
      expect(html).toContain(`href="${href}"`);
      expect(existsSync(`public${href}`)).toBe(true);
    }
  });

  it("has no untranslated direct UI literals", () => {
    expect(scanSource(readFileSync("src/app/[locale]/press/page.tsx", "utf8"))).toEqual([]);
  });
});
