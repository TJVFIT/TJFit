import { StartFunnelClient } from "@/components/start-funnel-client";
import { requireLocaleParam } from "@/lib/require-locale";

export default function StartPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return <StartFunnelClient locale={locale} />;
}
