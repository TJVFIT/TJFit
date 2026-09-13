"use client";

import { ReactNode } from "react";
import { MainErrorBoundary } from "@/components/main-error-boundary";
import { PageTransition } from "@/components/page-transition";
import { ScrollRevealInit } from "@/components/scroll-reveal-init";
import { ShellFooterGate } from "@/components/shell-footer-gate";
import { ShellNoticeGate } from "@/components/shell-notice-gate";
import { SiteSideOverlay } from "@/components/shell/site-side-overlay";
import { SiteTopBar } from "@/components/shell/site-top-bar";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";
import { PendingNotificationPoller } from "@/components/pending-notification-poller";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import type { Locale } from "@/lib/i18n";
import { PUBLIC_COPY } from "@/lib/public-offers-copy";

export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <DynamicIslandProvider>
      <PendingNotificationPoller />
      <div className="min-h-screen overflow-x-hidden bg-background text-text">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[80] focus:rounded-md focus:bg-violet-200 focus:px-5 focus:py-3 focus:text-black">{PUBLIC_COPY[locale].skip}</a>
        <ScrollToTop locale={locale} />
        <ScrollRevealInit />
        <SiteTopBar locale={locale} />
        <SiteSideOverlay locale={locale} />
        <ShellNoticeGate locale={locale} />
        <div className="opacity-100">
          <MainErrorBoundary>
            <main id="main-content" tabIndex={-1} className="relative z-[1] min-w-0 pt-28 outline-none lg:pt-16">
              <PageTransition>{children}</PageTransition>
            </main>
          </MainErrorBoundary>
          <ShellFooterGate locale={locale} />
        </div>
      </div>
    </DynamicIslandProvider>
  );
}
