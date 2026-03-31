"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
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
        { href: "/ai", label: copy.ai },
        { href: "/membership", label: copy.membership }
      ]
    : [
        { href: "/coaches", label: copy.coaches },
        { href: "/programs", label: copy.programs },
        { href: "/ai", label: copy.ai },
        { href: "/membership", label: copy.membership }
      ];

  const operationsLinks = isAdmin
    ? [
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
          { href: "/terms-and-conditions", label: copy.terms },
          { href: "/privacy-policy", label: copy.privacy },
          { href: "/refund-policy", label: copy.refund },
          { href: "/support", label: copy.support }
        ]
      : [
          { href: "/terms-and-conditions", label: copy.terms },
          { href: "/privacy-policy", label: copy.privacy },
          { href: "/refund-policy", label: copy.refund }
        ];

  return (
    <footer className="border-t border-white/[0.06] bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-zinc-400 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-white">TJFit</p>
          <p className="mt-3 max-w-sm">
            {copy.description}
          </p>
        </div>
        <div>
          <p className="font-medium text-white">{copy.platformTitle}</p>
          <div className="mt-3 flex flex-col gap-2">
            {platformLinks.map(({ href, label }) => (
              <Link key={href} href={`/${locale}${href}`} className="hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-medium text-white">{copy.operationsTitle}</p>
          <div className="mt-3 flex flex-col gap-2">
            {operationsLinks.map(({ href, label }) => (
              <Link key={href} href={`/${locale}${href}`} className="hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}