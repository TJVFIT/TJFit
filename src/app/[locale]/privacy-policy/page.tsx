import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { getPrivacyCopy } from "@/lib/legal-copy";
import { requireLocaleParam } from "@/lib/require-locale";

export default function PrivacyPolicyPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  const copy = getPrivacyCopy(locale);

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <AmbientOrbs variant="compact" />
      <span className="badge relative">{copy.badge}</span>
      <h1 className="relative text-4xl font-semibold">
        <span className="tj-title-shimmer">{copy.title}</span>
      </h1>
      {copy.paragraphs.map((paragraph) => (
        <p key={paragraph} className="relative text-sm leading-7 text-bright">
          {paragraph}
        </p>
      ))}
      <p className="relative text-sm text-faint">{copy.lastUpdatedLabel}</p>
    </div>
  );
}

