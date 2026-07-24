import { ComingSoonLaunchPage } from "@/components/coming-soon-launch-page";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function StorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);
  return <ComingSoonLaunchPage locale={locale} page="store" source="store-coming-soon" />;
}
