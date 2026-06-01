import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { getRefundCopy } from "@/lib/legal-copy";
import { requireLocaleParam } from "@/lib/require-locale";

export default function RefundPolicyPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  const copy = getRefundCopy(locale);

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <AmbientOrbs variant="compact" />
      <span className="badge relative">{copy.badge}</span>
      <h1 className="relative text-4xl font-semibold">
        <span className="tj-title-shimmer">{copy.title}</span>
      </h1>
      <section className="group/refund relative space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6 transition-[border-color,box-shadow] duration-200 hover:border-purple-300/25 hover:shadow-[0_0_28px_rgba(168,85,247,0.1)]">
        {copy.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-bright">
            {paragraph}
          </p>
        ))}
      </section>
      <p className="relative text-sm text-faint">{copy.lastUpdatedLabel}</p>
    </div>
  );
}
