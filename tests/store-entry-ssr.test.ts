import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { resolveCopyLocale, supportedLocales } from "@/lib/i18n";

const route = vi.hoisted(() => ({ pathname: "/tr/store" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/components/logo-intro", () => ({ LogoIntro: () => "LANGUAGE_PICKER" }));
vi.mock("@/components/guest-onboarding-popup", () => ({ GuestOnboardingPopup: () => "ACCOUNT_PROMPT" }));
vi.mock("@/components/main-error-boundary", () => ({ MainErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/components/page-transition", () => ({ PageTransition: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/components/ui/dynamic-island", () => ({ DynamicIslandProvider: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/components/scroll-reveal-init", () => ({ ScrollRevealInit: () => null }));
vi.mock("@/components/shell-footer-gate", () => ({ ShellFooterGate: () => null }));
vi.mock("@/components/shell-notice-gate", () => ({ ShellNoticeGate: () => null }));
vi.mock("@/components/shell/site-side-overlay", () => ({ SiteSideOverlay: () => null }));
vi.mock("@/components/shell/site-top-bar", () => ({ SiteTopBar: () => null }));
vi.mock("@/components/pending-notification-poller", () => ({ PendingNotificationPoller: () => null }));
vi.mock("@/components/ui/scroll-to-top", () => ({ ScrollToTop: () => null }));

import { SiteShell } from "@/components/site-shell";

function renderAt(pathname: string) {
  route.pathname = pathname;
  const shellProps = {
    locale: resolveCopyLocale(pathname.split("/")[1]),
    children: createElement("a", { href: "https://shop.tjfit.org" }, "Shop equipment"),
  };
  return renderToStaticMarkup(createElement(SiteShell, shellProps));
}

describe("equipment entry before hydration", () => {
  for (const locale of supportedLocales) {
    for (const section of ["store", "equipment"]) {
      it(`shows /${locale}/${section} without requiring an intro callback or account choice`, () => {
        const html = renderAt(`/${locale}/${section}`);
        expect(html).toContain('<a href="https://shop.tjfit.org">Shop equipment</a>');
        expect(html).toContain("opacity-100");
        expect(html).not.toContain("opacity-0");
        expect(html).not.toContain("LANGUAGE_PICKER");
        expect(html).not.toContain("ACCOUNT_PROMPT");
      });
    }
  }

  it("keeps nested store pages available without the intro", () => {
    const html = renderAt("/tr/store/products/mat");
    expect(html).not.toContain("LANGUAGE_PICKER");
    expect(html).not.toContain("opacity-0");
  });

  for (const pathname of ["/tr", "/tr/bundles", "/tr/storehouse", "/tr/equipment-guide", "/zz/store", "/store"]) {
    it(`also keeps ${pathname} visible without an entry overlay`, () => {
      const html = renderAt(pathname);
      expect(html).not.toContain("LANGUAGE_PICKER");
      expect(html).not.toContain("ACCOUNT_PROMPT");
      expect(html).not.toContain("opacity-0");
      expect(html).toContain('id="main-content"');
      expect(html).toContain('href="#main-content"');
    });
  }
});
