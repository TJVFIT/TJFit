import Link from "next/link";

import { requireLocaleParam } from "@/lib/require-locale";
import { getLegalHubCopy, getLegalHubCoachSections } from "@/lib/legal-hub-copy";

export default function LegalHubPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = getLegalHubCopy(locale);
  const coachSections = getLegalHubCoachSections(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="lg:grid lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:gap-12">
        <aside className="mb-10 lg:mb-0">
          <nav
            className="sticky top-24 flex flex-row flex-wrap gap-2 border-b border-white/[0.08] pb-4 lg:flex-col lg:border-b-0 lg:border-e lg:pb-0 lg:pe-6"
            aria-label="Legal sections"
          >
            <a href="#faq" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-400/30 hover:text-white">
              {copy.navFaq}
            </a>
            <a href="#user-terms" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-400/30 hover:text-white">
              {copy.navUserTerms}
            </a>
            <a href="#coach-terms" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-400/30 hover:text-white">
              {copy.navCoachTerms}
            </a>
            <a href="#privacy" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-400/30 hover:text-white">
              {copy.navPrivacy}
            </a>
          </nav>
        </aside>

        <div className="max-w-[680px] space-y-16">
          <header>
            <span className="badge">TJFit</span>
            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.pageTitle}</h1>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{copy.pageIntro}</p>
          </header>

          <section id="faq" className="scroll-mt-28">
            <h2 className="text-xl font-semibold text-white">{copy.faqTitle}</h2>
            <div className="mt-6 space-y-2">
              {copy.faq.map((item) => (
                <details key={item.id} className="legal-faq-details group rounded-2xl border border-white/[0.08] bg-[#111215]/80 transition-colors open:border-cyan-400/20 open:bg-[#111215]">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-100 outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {item.q}
                      <span className="text-cyan-400/80 transition-transform duration-300 ease-out group-open:rotate-180" aria-hidden>
                        ▾
                      </span>
                    </span>
                  </summary>
                  <div className="legal-faq-panel">
                    <div className="legal-faq-panel-inner px-4 pb-3">
                      <p className="text-sm leading-7 text-zinc-400">{item.a}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section id="user-terms" className="scroll-mt-28 space-y-4">
            <h2 className="text-xl font-semibold text-white">{copy.userTermsTitle}</h2>
            <div className="space-y-3 text-sm leading-7 text-zinc-400">
              {copy.userTermsParagraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Link href={`/${locale}/terms-and-conditions`} className="inline-flex text-sm font-medium text-cyan-300 hover:text-cyan-200">
              {copy.linkTermsPage} →
            </Link>
          </section>

          <section id="coach-terms" className="scroll-mt-28 space-y-4">
            <h2 className="text-xl font-semibold text-white">{copy.coachTermsTitle}</h2>
            <p className="text-sm text-zinc-500">{copy.coachTermsReadOnly}</p>
            <div className="space-y-6 rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6">
              {coachSections.map((s) => (
                <div key={s.heading}>
                  <h3 className="text-sm font-semibold text-zinc-200">{s.heading}</h3>
                  <div className="mt-2 space-y-2 text-sm leading-7 text-zinc-500">
                    {s.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="privacy" className="scroll-mt-28 space-y-4">
            <h2 className="text-xl font-semibold text-white">{copy.privacyTitle}</h2>
            <p className="text-sm leading-7 text-zinc-400">{copy.privacyPlaceholder}</p>
            <Link href={`/${locale}/privacy-policy`} className="inline-flex text-sm font-medium text-cyan-300 hover:text-cyan-200">
              {copy.linkPrivacyPage} →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
