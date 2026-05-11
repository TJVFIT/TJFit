import Link from "next/link";
import { ArrowRight, FileDown, Lock } from "lucide-react";

import { requireLocaleParam } from "@/lib/require-locale";

type Bundle = {
  key: string;
  name: string;
  program: string;
  diet: string;
  save: string;
  /** Program slug — when set, the bundle exposes a "Download PDF" CTA wired
   *  to /api/programs/download/[slug]. Empty = bundle not yet productized. */
  programSlug?: string;
  /** One-line value prop shown above the contents. */
  hook?: string;
};

const BUNDLES: Bundle[] = [
  {
    key: "fat-loss",
    name: "Fat Loss Bundle",
    hook: "12-week gym fat-loss protocol — resistance + cardio progression that preserves muscle.",
    program: "Gym Fat Loss Protocol",
    diet: "Clean Cutting Diet",
    save: "$10",
    programSlug: "gym-fat-loss-protocol-12w"
  },
  {
    key: "lean-bulk",
    name: "Lean Bulk Bundle",
    program: "Gym Mass Builder",
    diet: "Lean Bulk Diet",
    save: "$10"
  },
  {
    key: "home-starter",
    name: "Home Starter Bundle",
    program: "Home Fat Loss Starter",
    diet: "Clean Cut Starter",
    save: "Free"
  },
  {
    key: "definition",
    name: "Muscle Definition Bundle",
    program: "Hypertrophy System",
    diet: "Hard Cut Athlete Diet",
    save: "$10"
  }
];

export const metadata = {
  title: "Program Bundles · TJFit",
  description:
    "Premium fitness program bundles — 12-week protocols delivered as branded PDFs. Train smarter, eat sharper."
};

export default function BundlesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
        Bundles
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Programs as PDFs.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        Each bundle pairs a 12-week program with a matching diet system. Download
        as a printable PDF dossier, or train from your phone.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {BUNDLES.map((bundle) => {
          const downloadable = Boolean(bundle.programSlug);
          const downloadHref = bundle.programSlug
            ? `/api/programs/download/${bundle.programSlug}`
            : null;
          return (
            <article
              key={bundle.key}
              className={`group relative flex flex-col rounded-2xl border p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 ${
                downloadable
                  ? "border-cyan-400/25 bg-[linear-gradient(180deg,rgba(34,211,238,0.04),rgba(34,211,238,0.01))] shadow-[0_0_32px_rgba(34,211,238,0.08)] hover:border-cyan-400/40 hover:shadow-[0_0_44px_rgba(34,211,238,0.14)]"
                  : "border-divider bg-surface hover:border-cyan-300/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                    Bundle
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold text-white">
                    {bundle.name}
                  </h2>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                    bundle.save.toLowerCase() === "free"
                      ? "border-white/15 bg-white/[0.04] text-white/75"
                      : "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-100"
                  }`}
                >
                  {bundle.save}
                </span>
              </div>

              {bundle.hook ? (
                <p className="mt-3 text-sm leading-relaxed text-bright/90">{bundle.hook}</p>
              ) : null}

              <p className="mt-3 text-sm text-muted">
                {bundle.program} <span className="text-faint">+</span> {bundle.diet}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {downloadable ? (
                  <a
                    href={downloadHref as string}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-4 py-2 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.32)] active:scale-[0.97]"
                  >
                    <FileDown className="h-4 w-4" aria-hidden />
                    Download PDF
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/15 px-3.5 py-2 text-xs font-medium text-faint"
                    title="PDF generation queued for this bundle"
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    Coming soon
                  </span>
                )}
                <Link
                  href={`/${locale}/programs`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Browse programs
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>

              {downloadable ? (
                <p className="mt-3 text-[11px] text-faint">
                  Sign in required · branded 9-page dossier · A4 print-ready
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-divider bg-surface/40 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          For coaches & affiliates
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Each PDF is generated from the same 12-week blueprint that powers TJAI.
          Print it, mail it, white-label sections in your own coaching workflow —
          your TJFit purchase grants you a personal-use license.
        </p>
      </div>
    </section>
  );
}
