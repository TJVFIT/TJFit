import Link from "next/link";

import { CinematicListingHeader } from "@/components/cinematic-listing-header";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { requireLocaleParam } from "@/lib/require-locale";
import { getLegalHubCopy, getLegalHubCoachSections } from "@/lib/legal-hub-copy";

export default function LegalHubPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = getLegalHubCopy(locale);
  const coachSections = getLegalHubCoachSections(locale);

  return (
    <>
      <AmbientBackground variant="both" />
      <div className="relative z-[1]">
        <CinematicListingHeader
          eyebrow={copy.heroEyebrow}
          headlineBefore={copy.heroHeadlineBefore}
          headlineGradient={copy.heroHeadlineGradient}
          sub={copy.heroSub}
        />

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="lg:grid lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:gap-12">
            <aside className="mb-10 lg:mb-0">
              <nav
                className="sticky top-24 flex flex-row flex-wrap gap-2 border-b border-[#1E2028] pb-4 lg:flex-col lg:border-b-0 lg:border-e lg:border-[#1E2028] lg:pb-0 lg:pe-6"
                aria-label="Legal sections"
              >
                <a
                  href="#faq"
                  className="rounded-full border border-[#1E2028] px-3 py-1.5 text-xs text-[#A1A1AA] transition-[border-color,color] duration-150 hover:border-[rgba(255,255,255,0.1)] hover:text-white"
                >
                  {copy.navFaq}
                </a>
                <a
                  href="#user-terms"
                  className="rounded-full border border-[#1E2028] px-3 py-1.5 text-xs text-[#A1A1AA] transition-[border-color,color] duration-150 hover:border-[rgba(255,255,255,0.1)] hover:text-white"
                >
                  {copy.navUserTerms}
                </a>
                <a
                  href="#coach-terms"
                  className="rounded-full border border-[#1E2028] px-3 py-1.5 text-xs text-[#A1A1AA] transition-[border-color,color] duration-150 hover:border-[rgba(255,255,255,0.1)] hover:text-white"
                >
                  {copy.navCoachTerms}
                </a>
                <a
                  href="#privacy"
                  className="rounded-full border border-[#1E2028] px-3 py-1.5 text-xs text-[#A1A1AA] transition-[border-color,color] duration-150 hover:border-[rgba(255,255,255,0.1)] hover:text-white"
                >
                  {copy.navPrivacy}
                </a>
              </nav>
            </aside>

            <div className="max-w-[720px] space-y-16">
              <header className="hidden">
                <h1 className="sr-only">{copy.pageTitle}</h1>
                <p className="sr-only">{copy.pageIntro}</p>
              </header>

              <section id="faq" className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white">{copy.faqTitle}</h2>
                <div className="mt-6 space-y-2">
                  {copy.faq.map((item) => (
                    <details
                      key={item.id}
                      className="legal-faq-details group rounded-xl border border-[#1E2028] bg-[#111215] transition-[border-color] duration-200 ease-out open:border-[rgba(34,211,238,0.2)] hover:border-[rgba(255,255,255,0.1)]"
                    >
                      <summary className="cursor-pointer list-none px-5 py-4 text-[15px] font-semibold text-white outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center justify-between gap-3">
                          {item.q}
                          <span
                            className="text-[16px] text-[#52525B] transition-transform duration-[250ms] ease-out group-open:rotate-180"
                            aria-hidden
                          >
                            ▾
                          </span>
                        </span>
                      </summary>
                      <div className="legal-faq-panel">
                        <div className="legal-faq-panel-inner px-5 pb-5">
                          <p className="text-sm leading-[1.7] text-[#A1A1AA]">{item.a}</p>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              <section id="user-terms" className="scroll-mt-28 space-y-4">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white">{copy.userTermsTitle}</h2>
                <div className="space-y-3 text-base leading-[1.8] text-[#A1A1AA]">
                  {copy.userTermsParagraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <Link
                  href={`/${locale}/terms-and-conditions`}
                  className="inline-flex text-sm font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white"
                >
                  {copy.linkTermsPage} →
                </Link>
              </section>

              <section id="coach-terms" className="scroll-mt-28 space-y-4">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white">{copy.coachTermsTitle}</h2>
                <p className="text-sm text-[#52525B]">{copy.coachTermsReadOnly}</p>
                <div className="space-y-6 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
                  {coachSections.map((s) => (
                    <div key={s.heading}>
                      <h3 className="text-lg font-semibold text-white">{s.heading}</h3>
                      <div className="mt-2 space-y-2 text-sm leading-[1.8] text-[#A1A1AA]">
                        {s.paragraphs.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="privacy" className="scroll-mt-28 space-y-4">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white">{copy.privacyTitle}</h2>
                <div className="space-y-4 text-base leading-[1.8] text-[#A1A1AA]">
                  {copy.privacyParagraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="inline-flex text-sm font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white"
                >
                  {copy.linkPrivacyPage} →
                </Link>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
