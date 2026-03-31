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
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0B]/80 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_-1px_0_rgba(34,211,238,0.06)]">
        <SiteNav locale={locale} />
      </header>
      <GuestOnboardingPopup locale={locale} />

      <main>{children}</main>

      <SiteFooter locale={locale} />
    </div>
  );
}
