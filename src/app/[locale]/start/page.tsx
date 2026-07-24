import { StartFunnelClient } from "@/components/start-funnel-client";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function StartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);
  return <StartFunnelClient locale={locale} />;
}
