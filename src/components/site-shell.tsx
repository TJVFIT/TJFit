import { ReactNode } from "react";

import { DelayedEarlyAccessPopup } from "@/components/delayed-early-access-popup";
import { GuestOnboardingPopup } from "@/components/guest-onboarding-popup";
import { MainErrorBoundary } from "@/components/main-error-boundary";
import { PageTransition } from "@/components/page-transition";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { ShellFooterGate } from "@/components/shell-footer-gate";
import { ShellNoticeGate } from "@/components/shell-notice-gate";
import { SiteSidebar } from "@/components/site-sidebar";
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-text">
      <ScrollProgressBar />
      <SiteSidebar locale={locale} />
      <ShellNoticeGate locale={locale} />
      <GuestOnboardingPopup locale={locale} />
      <DelayedEarlyAccessPopup locale={locale} />

      <MainErrorBoundary>
        <main className={`relative z-[1] min-w-0 pt-14 lg:pt-0 ${desktopOffsetClass}`}>
          <PageTransition>{children}</PageTransition>
        </main>
      </MainErrorBoundary>

      <div className={desktopOffsetClass}>
        <ShellFooterGate locale={locale} />
      </div>
    </div>
  );
}
