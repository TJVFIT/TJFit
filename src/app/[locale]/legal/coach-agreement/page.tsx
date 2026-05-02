import type { Metadata } from "next";
import { redirect } from "next/navigation";

import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

const PAGE_METADATA: Record<Locale, { title: string; description: string }> = {
  en: { title: "Coach Agreement | TJFit", description: "The agreement TJFit coaches sign during application — commission, content ownership, payouts, SLAs." },
  tr: { title: "Koç Sözleşmesi | TJFit", description: "TJFit koçlarının başvuru sırasında imzaladığı sözleşme — komisyon, içerik sahipliği, ödemeler, SLA'lar." },
  ar: { title: "اتفاقية المدرب | TJFit", description: "الاتفاقية التي يوقعها مدربو TJFit أثناء التقديم — العمولة، ملكية المحتوى، المدفوعات، اتفاقيات الخدمة." },
  es: { title: "Acuerdo de Coach | TJFit", description: "El acuerdo que firman los coaches al aplicar — comisión, propiedad del contenido, pagos, SLAs." },
  fr: { title: "Accord Coach | TJFit", description: "L'accord signé par les coachs lors de la candidature — commission, propriété du contenu, paiements, SLA." }
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = requireLocaleParam(params.locale);
  const meta = PAGE_METADATA[locale] ?? PAGE_METADATA.en;
  return { title: meta.title, description: meta.description };
}

// The canonical coach agreement copy lives at /[locale]/coach/terms
// (already shipped). This route is the master-prompt-named alias —
// redirects to the canonical location so external links + the
// `/legal/coach-agreement` reference both resolve.
export default function CoachAgreementAlias({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  redirect(`/${locale}/coach/terms`);
}
