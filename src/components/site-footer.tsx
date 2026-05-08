"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/ui/Logo";
import { Locale, supportedLocales, LOCALE_META, type SupportedLocale } from "@/lib/i18n";
import { getFooterCopy } from "@/lib/launch-copy";

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

export function SiteFooter({ locale, routingLocale }: { locale: Locale; routingLocale: SupportedLocale }) {
  const pathname = usePathname() ?? "";
  const urlLocale = pathname.split("/").filter(Boolean)[0] ?? routingLocale;
  const copy = getFooterCopy(locale);
  const heads = COL_HEAD[locale] ?? COL_HEAD.en;

  const linkClass =
    "text-dim transition-colors duration-150 hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background inline-block rounded-sm text-sm leading-relaxed";

  const platformLinks = [
    { href: `/${routingLocale}/programs`, label: copy.programs },
    { href: `/${routingLocale}/diets`, label: copy.diets },
    { href: `/${routingLocale}/start`, label: copy.startFree },
    { href: `/${routingLocale}/membership`, label: MEMBERSHIP[locale] ?? MEMBERSHIP.en }
  ];

  const coachLinks = [
    { href: `/${routingLocale}/coaches`, label: copy.findCoach },
    { href: `/${routingLocale}/become-a-coach`, label: copy.becomeCoach }
  ];

  const companyLinks = [
    { href: `/${routingLocale}/legal`, label: copy.legalHub },
    { href: `/${routingLocale}/legal#faq`, label: copy.faq },
    { href: `/${routingLocale}/terms-and-conditions`, label: copy.terms },
    { href: `/${routingLocale}/privacy-policy`, label: copy.privacy },
    { href: `/${routingLocale}/refund-policy`, label: copy.refundPolicy },
    { href: `/${routingLocale}/press`, label: copy.press }
  ];

  const supportLinks = [
    { href: `/${routingLocale}/support`, label: copy.contact },
    { href: `/${routingLocale}/community`, label: copy.community }
  ];

  return (
    <footer className="border-t border-[rgba(255,255,255,0.04)] bg-background">
      <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-10 lg:px-8">
        <div className="mb-10 flex justify-center" aria-hidden>
          <svg width="100%" height="16" viewBox="0 0 400 16" className="max-w-md text-[rgba(255,255,255,0.08)]">
            <line x1="0" y1="8" x2="170" y2="8" stroke="currentColor" strokeWidth="0.5" />
            <line x1="230" y1="8" x2="400" y2="8" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="200" cy="8" r="3" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 sm:text-start lg:grid-cols-4 lg:gap-10">
          <div>
            <div className="inline-flex justify-center sm:justify-start">
              <Logo variant="full" size="footer" href={`/${routingLocale}`} glow />
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
          <p>© {new Date().getFullYear()} TJFit. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            {supportedLocales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}`}
                className={cnPill(loc === urlLocale)}
                aria-current={loc === urlLocale ? "true" : undefined}
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
    "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-[border-color,color,background-color] duration-150",
    active
      ? "border-[rgba(34,211,238,0.45)] bg-[rgba(34,211,238,0.12)] text-accent"
      : "border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,18,0.6)] text-dim hover:border-[rgba(34,211,238,0.35)] hover:text-muted",
  ].join(" ");
}
