"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Locale, supportedLocales, LOCALE_META } from "@/lib/i18n";
import { getFooterCopy } from "@/lib/launch-copy";

const LANG_BADGE: Record<Locale, string> = {
  en: "EN",
  tr: "TR",
  ar: "AR",
  es: "ES",
  fr: "FR",
};

const MEMBERSHIP: Record<Locale, string> = {
  en: "Membership",
  tr: "Uyelik",
  ar: "العضوية",
  es: "Membresia",
  fr: "Abonnement",
};

const COL_HEAD: Record<Locale, { platform: string; coaches: string }> = {
  en: { platform: "Platform", coaches: "Coaches" },
  tr: { platform: "Platform", coaches: "Koclar" },
  ar: { platform: "المنصة", coaches: "المدربون" },
  es: { platform: "Plataforma", coaches: "Coaches" },
  fr: { platform: "Plateforme", coaches: "Coachs" },
};

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = getFooterCopy(locale);
  const heads = COL_HEAD[locale] ?? COL_HEAD.en;

  // Small cyan accent dot before label that slides in from -3px on hover.
  const linkClass =
    "group/foot-link relative inline-block pl-0 text-sm leading-relaxed text-dim transition-[color,padding-left] duration-200 hover:pl-3 hover:text-purple-100 before:absolute before:left-0 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-x-2 before:-translate-y-1/2 before:rounded-full before:bg-purple-300 before:opacity-0 before:shadow-[0_0_8px_rgba(168, 85, 247,0.6)] before:transition-[opacity,transform] before:duration-200 before:content-[''] hover:before:translate-x-0 hover:before:opacity-100 motion-reduce:hover:pl-0 motion-reduce:hover:before:translate-x-0";

  const platformLinks = [
    { href: `/${locale}/bundles`, label: copy.programs },
    { href: `/${locale}/start`, label: copy.startFree },
    { href: `/${locale}/membership`, label: MEMBERSHIP[locale] ?? MEMBERSHIP.en },
  ];

  const coachLinks = [
    { href: `/${locale}/coaches`, label: copy.findCoach },
    { href: `/${locale}/become-a-coach`, label: copy.becomeCoach },
  ];

  const companyLinks = [
    { href: `/${locale}/legal`, label: copy.legalHub },
    { href: `/${locale}/legal#faq`, label: copy.faq },
    { href: `/${locale}/terms-and-conditions`, label: copy.terms },
    { href: `/${locale}/privacy-policy`, label: copy.privacy },
    { href: `/${locale}/refund-policy`, label: copy.refundPolicy },
    { href: `/${locale}/press`, label: "Press & Media" },
  ];

  const supportLinks = [
    { href: `/${locale}/support`, label: copy.contact },
    { href: `/${locale}/community`, label: copy.community },
  ];

  return (
    <footer className="border-t border-[rgba(255,255,255,0.04)] bg-background">
      <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-10 lg:px-8">
        <div className="mb-10 flex justify-center" aria-hidden>
          <svg width="100%" height="16" viewBox="0 0 400 16" className="max-w-md text-[rgba(255,255,255,0.08)]">
            <line x1="0" y1="8" x2="170" y2="8" stroke="currentColor" strokeWidth="0.5" />
            <line x1="230" y1="8" x2="400" y2="8" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="200" cy="8" r="3" fill="none" stroke="rgba(168, 85, 247,0.35)" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 sm:text-start lg:grid-cols-4 lg:gap-10">
          <div>
            <div className="inline-flex justify-center sm:justify-start">
              <Logo variant="full" size="footer" href={`/${locale}`} glow />
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed text-muted">{copy.tagline}</p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-dim sm:max-w-none">{copy.description}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">{heads.platform}</p>
            <div className="mt-4 flex flex-col gap-2.5">
              {platformLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={linkClass}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">{heads.coaches}</p>
            <div className="mt-4 flex flex-col gap-2.5">
              {coachLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={linkClass}>
                  {label}
                </Link>
              ))}
            </div>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.15em] text-dim">{copy.supportTitle}</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {supportLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={linkClass}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-dim">{copy.companyTitle}</p>
            <div className="mt-4 flex flex-col gap-2.5">
              {companyLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={linkClass}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.04)] px-6 py-5 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 text-xs text-dim sm:flex-row">
          <p>{new Date().getFullYear()} TJFit. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            {supportedLocales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}`}
                className={cnPill(loc === locale)}
                aria-current={loc === locale ? "true" : undefined}
                title={LOCALE_META[loc].native}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function cnPill(active: boolean) {
  return [
    "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-[border-color,color,background-color,box-shadow] duration-200",
    active
      ? "tj-chip-active border-[rgba(168, 85, 247,0.45)] bg-[rgba(168, 85, 247,0.12)] text-accent"
      : "border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,18,0.6)] text-dim hover:border-[rgba(168, 85, 247,0.35)] hover:bg-[rgba(168, 85, 247,0.06)] hover:text-purple-100 hover:shadow-[0_0_14px_rgba(168, 85, 247,0.15)]",
  ].join(" ");
}
