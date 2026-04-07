"use client";

import { ReactNode, useEffect, useState } from "react";

import { CursorTrail } from "@/components/cursor-trail";
import { DelayedEarlyAccessPopup } from "@/components/delayed-early-access-popup";
import { GuestOnboardingPopup } from "@/components/guest-onboarding-popup";
import { LogoIntro } from "@/components/logo-intro";
import { MainErrorBoundary } from "@/components/main-error-boundary";
import { PageTransition } from "@/components/page-transition";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { ShellFooterGate } from "@/components/shell-footer-gate";
import { ShellNoticeGate } from "@/components/shell-notice-gate";
import { SiteSidebar } from "@/components/site-sidebar";
import { SpotlightCursor } from "@/components/spotlight-cursor";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";
import { PendingNotificationPoller } from "@/components/pending-notification-poller";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { Locale, getDirection } from "@/lib/i18n";

export function SiteShell({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const direction = getDirection(locale);
  const desktopOffsetClass = direction === "rtl" ? "lg:pe-16" : "lg:ps-16";
  const [introDone, setIntroDone] = useState(true);
  const { blur, scale } = useScrollVelocity();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = window.sessionStorage.getItem("tjfit_intro_seen");
      if (!seen) setIntroDone(false);
    } catch {
      setIntroDone(true);
    }
  }, []);

  const handleIntroComplete = () => {
    try {
      window.sessionStorage.setItem("tjfit_intro_seen", "1");
    } catch {}
    setIntroDone(true);
  };

  return (
    <DynamicIslandProvider>
      <PendingNotificationPoller />
      <div className="min-h-screen overflow-x-hidden bg-background text-text">
        {!introDone ? <LogoIntro onComplete={handleIntroComplete} /> : null}
        <CursorTrail />
        <SpotlightCursor />
        <ScrollToTop />
        <ScrollProgressBar />
        <SiteSidebar locale={locale} />
        <ShellNoticeGate locale={locale} />
        <GuestOnboardingPopup locale={locale} />
        <DelayedEarlyAccessPopup locale={locale} />

        <div className={`transition-opacity duration-400 ${introDone ? "opacity-100" : "opacity-0"}`}>
          <MainErrorBoundary>
            <main
              className={`relative z-[1] min-w-0 pt-14 transition-[filter,transform] duration-100 ease-out lg:pt-0 ${desktopOffsetClass}`}
              style={{ filter: `blur(${blur}px)`, transform: `scaleY(${scale})`, transformOrigin: "center top" }}
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </MainErrorBoundary>

          <div className={desktopOffsetClass}>
            <ShellFooterGate locale={locale} />
          </div>
        </div>
      </div>
    </DynamicIslandProvider>
  );
}
