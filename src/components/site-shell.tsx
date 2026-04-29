"use client";

import { ReactNode, useState } from "react";

import { DelayedEarlyAccessPopup } from "@/components/delayed-early-access-popup";
import { GuestOnboardingPopup } from "@/components/guest-onboarding-popup";
import { LogoIntro } from "@/components/logo-intro";
import { MainErrorBoundary } from "@/components/main-error-boundary";
import { PageTransition } from "@/components/page-transition";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { ScrollRevealInit } from "@/components/scroll-reveal-init";
import { ShellFooterGate } from "@/components/shell-footer-gate";
import { ShellNoticeGate } from "@/components/shell-notice-gate";
import { SiteSideOverlay } from "@/components/shell/site-side-overlay";
import { SiteTopBar } from "@/components/shell/site-top-bar";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";
import { PendingNotificationPoller } from "@/components/pending-notification-poller";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { type Locale, type SupportedLocale } from "@/lib/i18n";

export function SiteShell({
  locale,
  routingLocale,
  children
}: {
  locale: Locale;
  routingLocale: SupportedLocale;
  children: ReactNode;
}) {
  const [introDone, setIntroDone] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const navChrome = getNavChromeCopy(locale);

  const handleIntroComplete = () => {
    setIntroDone(true);
  };

  return (
    <DynamicIslandProvider>
      <PendingNotificationPoller />
      <div className="min-h-screen overflow-x-hidden bg-background text-text">
        {!introDone ? <LogoIntro locale={locale} onComplete={handleIntroComplete} /> : null}
        <a
          href="#site-main-content"
          className="sr-only font-medium text-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#0a0a0b] focus:px-4 focus:py-2 focus:ring-2 focus:ring-accent"
        >
          {navChrome.skipToContent}
        </a>
        <ScrollToTop />
        <ScrollProgressBar />
        <ScrollRevealInit />
        <SiteTopBar
          locale={locale}
          routingLocale={routingLocale}
          sideNavOpen={sideNavOpen}
          onOpenSideNav={() => setSideNavOpen(true)}
        />
        <SiteSideOverlay
          locale={locale}
          routingLocale={routingLocale}
          open={sideNavOpen}
          onOpenChange={setSideNavOpen}
        />
        <ShellNoticeGate locale={locale} />
        <GuestOnboardingPopup locale={locale} />
        <DelayedEarlyAccessPopup locale={locale} />

        <div
          className={`transition-opacity duration-500 motion-reduce:duration-150 ease-premium motion-reduce:transition-none ${introDone ? "opacity-100" : "opacity-0"}`}
        >
          <MainErrorBoundary>
            <main
              id="site-main-content"
              tabIndex={-1}
              className="relative z-[1] min-w-0 scroll-mt-20 pt-14 outline-none sm:pt-16"
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </MainErrorBoundary>

          <div>
            <ShellFooterGate locale={locale} routingLocale={routingLocale} />
          </div>
        </div>
      </div>
    </DynamicIslandProvider>
  );
}
