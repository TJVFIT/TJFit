import { isLocale } from "@/lib/i18n";
import { BILLING_PROVIDER, TERMS_VERSION } from "@/lib/legal";
import { getTermsCopy } from "@/lib/legal-copy";

export default function TermsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return null;

  const copy = getTermsCopy(params.locale, BILLING_PROVIDER, TERMS_VERSION);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <span className="badge">{copy.badge}</span>
      <h1 className="text-4xl font-semibold text-white">{copy.title}</h1>
      {copy.sections.map((section) => (
        <section key={section.title} className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-zinc-300">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <p className="text-sm text-zinc-500">{copy.versionLabel}</p>
    </div>
  );
}

