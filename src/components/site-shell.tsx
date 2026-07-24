import { ReactNode } from "react";

import { GuestOnboardingPopup } from "@/components/guest-onboarding-popup";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { Locale } from "@/lib/i18n";

export function SiteShell({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-background text-text">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-background/80 backdrop-blur-2xl">
        <SiteNav locale={locale} />
      </header>
      <GuestOnboardingPopup locale={locale} />

      <main id="main-content">{children}</main>

      <SiteFooter locale={locale} />
    </div>
  );
}
