"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const isCoach = role === "coach";

  const platformLinks = isAdmin
    ? [
        { href: "/coaches", label: "Coaches (Coming Soon)" },
        { href: "/programs", label: "Programs Marketplace" },
        { href: "/ai", label: "TJFIT AI (Coming Soon)" },
        { href: "/membership", label: "Subscription (Coming Soon)" }
      ]
    : [
        { href: "/coaches", label: "Coaches (Coming Soon)" },
        { href: "/programs", label: "Programs Marketplace" },
        { href: "/ai", label: "TJFIT AI (Coming Soon)" },
        { href: "/membership", label: "Subscription (Coming Soon)" }
      ];

  const operationsLinks = isAdmin
    ? [
        { href: "/terms-and-conditions", label: "Terms of Service" },
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/refund-policy", label: "Refund Policy" },
        { href: "/support", label: "Support" },
        { href: "/coach-dashboard", label: "Coach Dashboard" },
        { href: "/admin", label: "Admin Panel" },
        { href: "/checkout", label: "Checkout" }
      ]
    : isCoach
      ? [
          { href: "/terms-and-conditions", label: "Terms of Service" },
          { href: "/privacy-policy", label: "Privacy Policy" },
          { href: "/refund-policy", label: "Refund Policy" },
          { href: "/support", label: "Support" }
        ]
      : [
          { href: "/terms-and-conditions", label: "Terms of Service" },
          { href: "/privacy-policy", label: "Privacy Policy" },
          { href: "/refund-policy", label: "Refund Policy" }
        ];

  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-zinc-400 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-white">TJFit</p>
          <p className="mt-3 max-w-sm">
            Premium online coaching and digital programs platform for fitness, performance, and recovery.
          </p>
        </div>
        <div>
          <p className="font-medium text-white">Platform</p>
          <div className="mt-3 flex flex-col gap-2">
            {platformLinks.map(({ href, label }) => (
              <Link key={href} href={`/${locale}${href}`} className="hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-medium text-white">Operations</p>
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