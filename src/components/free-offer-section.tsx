"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import type { Program } from "@/lib/content";
import { getFreeOfferCopy } from "@/lib/free-offer-copy";
import type { Locale } from "@/lib/i18n";
import { localizeProgram } from "@/lib/program-localization";
import { isSafeRedirect } from "@/lib/safe-redirect";

function signupWithRedirect(locale: Locale, path: string) {
  const enc = encodeURIComponent(path);
  return `/${locale}/signup?redirect=${enc}`;
}

export function FreeOfferSection({ locale, freePrograms }: { locale: Locale; freePrograms: Program[] }) {
  const copy = getFreeOfferCopy(locale);
  const pathname = usePathname() ?? "";
  const { user, loading } = useAuth();
  const loginHref =
    pathname && isSafeRedirect(pathname, locale)
      ? `/${locale}/login?redirect=${encodeURIComponent(pathname)}`
      : `/${locale}/login`;

  const { training, diet } = useMemo(() => {
    const train = freePrograms.find((p) => p.category.toLowerCase() !== "nutrition");
    const nut = freePrograms.find((p) => p.category.toLowerCase() === "nutrition");
    return { training: train, diet: nut };
  }, [freePrograms]);

  if (!training && !diet) return null;

  const renderCard = (p: Program, kind: "training" | "diet") => {
    const loc = localizeProgram(p, locale);
    const hrefContent = `/${locale}/programs/${p.slug}`;
    const href = user ? hrefContent : signupWithRedirect(locale, hrefContent);

    return (
      <div className="relative flex h-full flex-col rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_0_0_1px_var(--color-border)]">
        <span className="absolute right-3 top-3 rounded-md border border-[rgba(167,139,250,0.35)] bg-[rgba(167,139,250,0.12)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
          FREE
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          {kind === "training" ? copy.programKind : copy.dietKind}
        </p>
        <h3 className="mt-3 pr-14 text-lg font-semibold leading-snug text-white">{loc.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{loc.description}</p>
        {loading ? (
          <div className="tj-skeleton mt-6 h-12 w-full rounded-full" aria-hidden />
        ) : (
          <Link
            href={href}
            className="lux-btn-primary mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-[#09090B]"
          >
            {copy.getFreeAccess}
          </Link>
        )}
      </div>
    );
  };

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)] py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#22D3EE]">
            {copy.badge}
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white sm:text-[32px] sm:leading-tight">{copy.title}</h2>
          <p className="mt-3 text-base leading-[1.7] text-[var(--color-text-secondary)]">{copy.subtitle}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {training ? renderCard(training, "training") : null}
          {diet ? renderCard(diet, "diet") : null}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          {copy.signInHint}{" "}
          <Link href={loginHref} className="text-[var(--color-text-secondary)] underline-offset-4 transition-colors duration-150 hover:text-white">
            {copy.signIn}
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
          Structured 12-week system. No guesswork. · Daily meals, macros, and recipes included.
        </p>
        <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">Free to join. No credit card required.</p>
      </div>
    </section>
  );
}
