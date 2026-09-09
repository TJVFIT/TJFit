import { ComingSoonLaunchPage } from "@/components/coming-soon-launch-page";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function LivePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  return <ComingSoonLaunchPage locale={locale} page="live" source="live-coming-soon" />;
}
