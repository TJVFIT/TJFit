import { ReactNode } from "react";

import { GuestOnboardingPopup } from "@/components/guest-onboarding-popup";
import { SiteFooter } from "@/components/site-footer";
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
    <div className="min-h-screen bg-background text-text">
      <ShellHeader locale={locale} />
      <GuestOnboardingPopup locale={locale} />

      <main>{children}</main>

      <SiteFooter locale={locale} />
    </div>
  );
}
