"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

import { GuestOnboardingPopup } from "@/components/guest-onboarding-popup";
import { LogoIntro } from "@/components/logo-intro";
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
import { isSupportedLocale, type Locale } from "@/lib/i18n";

export function SiteShell({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [, routeLocale, section] = (pathname ?? "").split("/");
  const isEquipmentRoute = Boolean(routeLocale && isSupportedLocale(routeLocale)
    && (section === "store" || section === "equipment"));
  const [introDone, setIntroDone] = useState(false);
  const contentVisible = isEquipmentRoute || introDone;

  const handleIntroComplete = () => {
    setIntroDone(true);
  };

  return (
    <DynamicIslandProvider>
      <PendingNotificationPoller />
      <div className="min-h-screen overflow-x-hidden bg-background text-text">
        {!contentVisible ? <LogoIntro locale={locale} onComplete={handleIntroComplete} /> : null}
        <ScrollToTop />
        <ScrollRevealInit />
        <SiteTopBar locale={locale} />
        <SiteSideOverlay locale={locale} />
        <ShellNoticeGate locale={locale} />
        {!isEquipmentRoute ? <GuestOnboardingPopup locale={locale} /> : null}

        <div className={`transition-opacity duration-400 ${contentVisible ? "opacity-100" : "opacity-0"}`}>
          <MainErrorBoundary>
            <main
              className="relative z-[1] min-w-0 pt-14 sm:pt-16"
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </MainErrorBoundary>

          <div>
            <ShellFooterGate locale={locale} />
          </div>
        </div>
      </div>
    </DynamicIslandProvider>
  );
}
