"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth-provider";
import type { Locale } from "@/lib/i18n";

export function ProtectedRoute({
  children,
  locale = "en"
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="h-48 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-4 py-16 text-center">
        <div>
          <span className="badge">Members only</span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
            Sign in to continue.
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Your purchases, coins and training progress are tied to your TJFit account.
          </p>
          <Link
            href={`/${locale}/login`}
            className="gradient-button mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
