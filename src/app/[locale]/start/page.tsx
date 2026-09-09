import { StartFunnelClient } from "@/components/start-funnel-client";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function StartPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  return <StartFunnelClient locale={locale} />;
}
