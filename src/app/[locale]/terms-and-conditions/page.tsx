import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { BILLING_PROVIDER, TERMS_VERSION } from "@/lib/legal";
import { getTermsCopy } from "@/lib/legal-copy";
import { requireLocaleParam } from "@/lib/require-locale";

export default function TermsPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  const copy = getTermsCopy(locale, BILLING_PROVIDER, TERMS_VERSION);

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <AmbientOrbs variant="compact" />
      <span className="badge relative">{copy.badge}</span>
      <h1 className="relative text-4xl font-semibold">
        <span className="tj-title-shimmer">{copy.title}</span>
      </h1>
      {copy.sections.map((section) => (
        <section key={section.title} className="group/sect space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6 transition-[border-color,box-shadow] duration-200 hover:border-purple-300/25 hover:shadow-[0_0_28px_rgba(168, 85, 247,0.1)]">
          <h2 className="text-lg font-semibold text-white transition-colors duration-200 group-hover/sect:text-purple-50">{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-bright">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <p className="text-sm text-faint">{copy.versionLabel}</p>
    </div>
  );
}

