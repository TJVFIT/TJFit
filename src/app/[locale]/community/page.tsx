import { isLocale, type Locale } from "@/lib/i18n";
import { CommunityHub } from "@/components/community-hub";

export default function CommunityPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { tab?: string };
}) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return <CommunityHub locale={params.locale as Locale} initialTab={searchParams?.tab ?? null} />;
}
