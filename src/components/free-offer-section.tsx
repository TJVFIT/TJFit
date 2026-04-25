"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import type { Program } from "@/lib/content";
import { getFreeOfferCopy } from "@/lib/free-offer-copy";
import type { Locale } from "@/lib/i18n";
import { localizeProgram } from "@/lib/program-localization";
import { isSafeRedirect } from "@/lib/safe-redirect";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

function signupWithRedirect(locale: Locale, path: string) {
  const enc = encodeURIComponent(path);
  return `/${locale}/signup?redirect=${enc}`;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const apply = () => setReduce(mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } catch {
      return;
    }
  }, []);
  return reduce;
}

/** Highlights first case-insensitive "free" in title with gradient (EN + similar). */
function renderTitleWithFreeGradient(title: string) {
  const lower = title.toLowerCase();
  const idx = lower.indexOf("free");
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">
        {title.slice(idx, idx + 4)}
      </span>
      {title.slice(idx + 4)}
    </>
  );
}

function stripTrailingArrow(label: string) {
  return label.replace(/\s*[→←]\s*$/u, "").trim();
}

function MagneticCtaLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  const ref = useMagneticButton<HTMLAnchorElement>(0.3);
  return (
    <Link href={href} className={className} ref={ref}>
      {children}
    </Link>
  );
}

export function FreeOfferSection({
  locale,
  freePrograms,
  sectionClassName
}: {
  locale: Locale;
  freePrograms: Program[];
  /** Merged onto outer <section> (e.g. min-height for immersive layout) */
  sectionClassName?: string;
}) {
  const copy = getFreeOfferCopy(locale);
  const pathname = usePathname() ?? "";
  const { user, loading } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(sectionRef, { threshold: 0.15, rootMargin: "0px", once: true });
  const visible = inView || reduceMotion;

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

  const ctaLabel = stripTrailingArrow(copy.getFreeAccess);

  const reveal = (delayMs: number, y: number, durationClass = "duration-500", easeClass = "ease-out") =>
    cn(
      "transition-[opacity,transform] will-change-[opacity,transform]",
      durationClass,
      easeClass,
      "motion-reduce:transition-none motion-reduce:duration-0",
      visible ? "translate-y-0 opacity-100" : "opacity-0",
      !visible && !reduceMotion && y === 8 && "translate-y-2",
      !visible && !reduceMotion && y === 12 && "translate-y-3",
      !visible && !reduceMotion && y === 16 && "translate-y-4"
    );

  const trustItems = [copy.trustLine1, copy.trustLine2, copy.trustLine3];

  const renderCard = (p: Program, kind: "training" | "diet", cardDelayMs: number) => {
    const loc = localizeProgram(p, locale);
    const hrefContent = `/${locale}/programs/${p.slug}`;
    const href = user ? hrefContent : signupWithRedirect(locale, hrefContent);

    return (
      <div
        className={cn(
          "transition-[opacity,transform] duration-500 will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:duration-0",
          "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        )}
        style={{
          transitionDelay: visible && !reduceMotion ? `${cardDelayMs}ms` : "0ms"
        }}
      >
        <div
          className={cn(
            "free-starter-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-divider bg-surface p-8",
            "tj-card-aura",
            "before:pointer-events-none before:absolute before:-right-[60px] before:-top-[60px] before:h-[200px] before:w-[200px] before:rounded-full",
            "before:bg-[radial-gradient(circle,rgba(34,211,238,0.06)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-out",
            "transition-[transform,border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
            "hover:border-[rgba(34,211,238,0.25)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(34,211,238,0.12),0_0_60px_rgba(34,211,238,0.04)]",
            "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            "hover:-translate-y-1.5 hover:before:opacity-100 motion-reduce:hover:before:opacity-0"
          )}
        >
        <span className="absolute right-6 top-6 rounded-full border border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.12)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-accent-violet">
          FREE
        </span>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-dim">
          {kind === "training" ? copy.programKind : copy.dietKind}
        </p>
        <h3 className="mb-3 text-[22px] font-bold tracking-[-0.01em] text-white">{loc.title}</h3>
        <p className="mb-8 flex-1 text-sm leading-relaxed text-muted">{loc.description}</p>
        <div className="mb-6 h-px bg-divider" aria-hidden />
        {loading ? (
          <div className="tj-skeleton h-[50px] w-full rounded-[10px]" aria-hidden />
        ) : (
          <MagneticCtaLink
            href={href}
            className={cn(
              "fo-cta group/cta relative inline-flex w-full items-center justify-center rounded-[10px] border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.10)]",
              "px-6 py-3.5 text-center text-sm font-semibold tracking-[0.01em] text-accent",
              "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
              "hover:border-[rgba(34,211,238,0.5)] hover:bg-[rgba(34,211,238,0.16)] hover:shadow-[0_0_20px_rgba(34,211,238,0.12)] hover:[transform:translateY(-1px)]",
              "active:bg-[rgba(34,211,238,0.20)] active:[transform:translateY(0)]",
              "motion-reduce:hover:[transform:none] motion-reduce:active:[transform:none]"
            )}
          >
            {ctaLabel}
            <span className="fo-cta-arrow ml-1.5 inline-block transition-transform duration-200 ease-out group-hover/cta:translate-x-1 motion-reduce:group-hover/cta:translate-x-0">
              →
            </span>
          </MagneticCtaLink>
        )}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative overflow-hidden border-b border-divider bg-background py-16 lg:py-24",
        sectionClassName
      )}
      aria-labelledby="free-starters-heading"
    >
      <div
        className="pointer-events-none absolute -left-[100px] top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.05)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[80px] top-[30%] h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.04)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1200px] px-6">
        <span
          className={cn(
            "mb-5 inline-flex rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.06)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-accent",
            reveal(0, 8)
          )}
          style={{ transitionDelay: visible && !reduceMotion ? "0ms" : "0ms" }}
        >
          {copy.badge}
        </span>

        <h2
          id="free-starters-heading"
          className={cn(
            "max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-[-0.025em] text-white lg:text-[48px]",
            reveal(80, 16, "duration-500", "[transition-timing-function:cubic-bezier(0,0,0.2,1)]")
          )}
          style={{ transitionDelay: visible && !reduceMotion ? "80ms" : "0ms" }}
        >
          {renderTitleWithFreeGradient(copy.title)}
        </h2>

        <p
          className={cn(
            "mt-0 max-w-[440px] text-[17px] leading-relaxed text-muted lg:mt-1",
            "mb-12 lg:mb-[48px]",
            reveal(160, 12)
          )}
          style={{ transitionDelay: visible && !reduceMotion ? "160ms" : "0ms" }}
        >
          {copy.subtitle}
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {training ? renderCard(training, "training", 200) : null}
          {diet ? renderCard(diet, "diet", 320) : null}
        </div>

        <p
          className={cn(
            "mt-6 text-center text-[13px] text-dim",
            "transition-opacity duration-[400ms] ease-out motion-reduce:transition-none",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: visible && !reduceMotion ? "420ms" : "0ms" }}
        >
          {copy.signInHint}{" "}
          <Link
            href={loginHref}
            className="text-muted transition-colors duration-150 hover:text-white"
          >
            {copy.signIn}
          </Link>
        </p>

        <div
          className={cn(
            "mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2",
            "transition-opacity duration-[400ms] ease-out motion-reduce:transition-none",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: visible && !reduceMotion ? "500ms" : "0ms" }}
        >
          {trustItems.map((text, i) => (
            <Fragment key={text}>
              {i > 0 ? (
                <span className="hidden text-[#1E2028] md:inline" aria-hidden>
                  ·
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 shrink-0 text-accent/70" strokeWidth={2.5} aria-hidden />
                <span className="text-[13px] tracking-[0.01em] text-dim">{text}</span>
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
