"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth-provider";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { Locale } from "@/lib/i18n";
import { getFooterCopy } from "@/lib/launch-copy";

export function SiteFooter({ locale }: { locale: Locale }) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const isCoach = role === "coach";
  const copy = getFooterCopy(locale);

  const platformLinks = isAdmin
    ? [
        { href: "/coaches", label: copy.coaches },
        { href: "/programs", label: copy.programs },
        { href: "/diets", label: copy.diets },
        { href: "/community", label: copy.community },
        { href: "/membership", label: copy.membership }
      ]
    : [
        { href: "/coaches", label: copy.coaches },
        { href: "/programs", label: copy.programs },
        { href: "/diets", label: copy.diets },
        { href: "/community", label: copy.community },
        { href: "/membership", label: copy.membership }
      ];

  const operationsLinks = isAdmin
    ? [
        { href: "/legal", label: copy.legalHub },
        { href: "/terms-and-conditions", label: copy.terms },
        { href: "/privacy-policy", label: copy.privacy },
        { href: "/refund-policy", label: copy.refund },
        { href: "/support", label: copy.support },
        { href: "/coach-dashboard", label: copy.coachDashboard },
        { href: "/admin", label: copy.adminPanel },
        { href: "/checkout", label: copy.checkout }
      ]
    : isCoach
      ? [
          { href: "/legal", label: copy.legalHub },
          { href: "/terms-and-conditions", label: copy.terms },
          { href: "/privacy-policy", label: copy.privacy },
          { href: "/refund-policy", label: copy.refund },
          { href: "/support", label: copy.support }
        ]
      : [
          { href: "/legal", label: copy.legalHub },
          { href: "/terms-and-conditions", label: copy.terms },
          { href: "/privacy-policy", label: copy.privacy },
          { href: "/refund-policy", label: copy.refund },
          { href: "/support", label: copy.support }
        ];

  const linkClass =
    "text-[#A1A1AA] transition-colors duration-150 hover:text-white inline-block";

  return (
    <footer className="border-t border-[#1E2028] bg-[#09090B]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 text-sm lg:grid-cols-4 lg:gap-12 lg:px-8">
        <div>
          <div className="inline-flex py-1">
            <Logo variant="full" size="footer" href={`/${locale}`} />
          </div>
          <p className="mt-3 text-sm font-medium uppercase tracking-widest text-[#A1A1AA]">
            Transform. Perform. Dominate.
          </p>
          <p className="mt-4 max-w-sm leading-relaxed text-zinc-500">{copy.description}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{copy.platformTitle}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {platformLinks.map(({ href, label }) => (
              <Link key={href} href={`/${locale}${href}`} className={linkClass}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="tj-eyebrow">{copy.operationsTitle}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {operationsLinks.map(({ href, label }) => (
              <Link key={href} href={`/${locale}${href}`} className={linkClass}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="lg:max-w-xs">
          <p className="tj-eyebrow">{copy.leadColumnTitle}</p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">{copy.leadColumnSub}</p>
          <div className="mt-5">
            <LeadCaptureForm locale={locale} source="footer" variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}