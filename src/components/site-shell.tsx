"use client";

import { ReactNode, useState } from "react";

import { CursorTrail } from "@/components/cursor-trail";
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
import { SpotlightCursor } from "@/components/spotlight-cursor";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";
import { PendingNotificationPoller } from "@/components/pending-notification-poller";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { Locale } from "@/lib/i18n";

export function SiteShell({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [introDone, setIntroDone] = useState(false);
  const { blur, scale } = useScrollVelocity();

  const handleIntroComplete = () => {
    setIntroDone(true);
  };

  return (
    <DynamicIslandProvider>
      <PendingNotificationPoller />
      <div className="min-h-screen overflow-x-hidden bg-background text-text">
        {!introDone ? <LogoIntro locale={locale} onComplete={handleIntroComplete} /> : null}
        <CursorTrail />
        <SpotlightCursor />
        <ScrollToTop />
        <ScrollProgressBar />
        <ScrollRevealInit />
        <SiteTopBar locale={locale} />
        <SiteSideOverlay locale={locale} />
        <ShellNoticeGate locale={locale} />
        <GuestOnboardingPopup locale={locale} />
        <DelayedEarlyAccessPopup locale={locale} />

        <div className={`transition-opacity duration-400 ${introDone ? "opacity-100" : "opacity-0"}`}>
          <MainErrorBoundary>
            <main
              className="relative z-[1] min-w-0 pt-14 transition-[filter,transform] duration-100 ease-out sm:pt-16"
              style={{ filter: `blur(${blur}px)`, transform: `scaleY(${scale})`, transformOrigin: "center top" }}
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
