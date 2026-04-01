import { getRefundCopy } from "@/lib/legal-copy";
import { requireLocaleParam } from "@/lib/require-locale";

export default function RefundPolicyPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  const copy = getRefundCopy(locale);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <span className="badge">{copy.badge}</span>
      <h1 className="text-4xl font-semibold text-white">{copy.title}</h1>
      {copy.paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-7 text-zinc-300">
          {paragraph}
        </p>
      ))}
      <p className="text-sm text-zinc-500">{copy.lastUpdatedLabel}</p>
    </div>
  );
}

