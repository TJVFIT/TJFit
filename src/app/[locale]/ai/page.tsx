import { ComingSoonLaunchPage } from "@/components/coming-soon-launch-page";
import { requireLocaleParam } from "@/lib/require-locale";

export default function AiPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return <ComingSoonLaunchPage locale={locale} page="ai" source="ai-coming-soon" />;
}
