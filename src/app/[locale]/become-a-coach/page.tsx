import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { isLocale } from "@/lib/i18n";

export default async function BecomeCoachPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return (
    <div className="page-shell py-14 sm:py-20">
      <section className="grid gap-12 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div>
          <span className="badge">Coach with TJFit / founding cohort</span>
          <h1 className="mt-7 max-w-[10ch] font-display text-5xl font-semibold leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl">
            Bring rigor to the platform.
          </h1>
        </div>
        <div>
          <p className="text-base leading-8 text-zinc-300">
            TJFit is reviewing a limited group of coaches for its first public marketplace cohort. Applications are handled personally while the verification system is in private intake.
          </p>
          <a
            href="mailto:tjfit.org@gmail.com?subject=TJFit%20founding%20coach%20application"
            className="gradient-button mt-7 inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold"
          >
            Start an application
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>

      <section className="mt-14 grid gap-8 border-t border-white/10 pt-12 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
            What to include
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-500">
            Send one concise application. TJFit will request sensitive documents only through an approved private channel.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2">
          {[
            "Your coaching specialty and current location",
            "Recognized certifications and issuing bodies",
            "Languages and preferred client profiles",
            "Links to professional work or verified results"
          ].map((item, index) => (
            <article key={item} className="min-h-40 bg-background p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/15 text-accent-soft">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-mono text-[10px] text-zinc-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-8 text-sm leading-7 text-zinc-300">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7 text-sm text-zinc-500">
        <p>Approval is not guaranteed. Credentials, identity and service scope are reviewed before listing.</p>
        <Link href={`/${locale}/coaches`} className="text-zinc-300 transition hover:text-white">
          Read the coach standard
        </Link>
      </div>
    </div>
  );
}
