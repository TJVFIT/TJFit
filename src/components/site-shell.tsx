import { ReactNode } from "react";

import { DelayedEarlyAccessPopup } from "@/components/delayed-early-access-popup";
import { GuestOnboardingPopup } from "@/components/guest-onboarding-popup";
import { MainErrorBoundary } from "@/components/main-error-boundary";
import { ShellFooterGate } from "@/components/shell-footer-gate";
import { ShellHeader } from "@/components/shell-header";
import { Locale } from "@/lib/i18n";

export function SiteShell({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-text">
      <ShellHeader locale={locale} />
      <GuestOnboardingPopup locale={locale} />
      <DelayedEarlyAccessPopup locale={locale} />

      <MainErrorBoundary>
        <main className="min-w-0">{children}</main>
      </MainErrorBoundary>

      <ShellFooterGate locale={locale} />
    </div>
  );
}
