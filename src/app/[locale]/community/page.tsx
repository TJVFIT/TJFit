import { isLocale, type Locale } from "@/lib/i18n";
import { CommunityHub } from "@/components/community-hub";

export default async function CommunityPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { locale: localeParam } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!isLocale(localeParam)) {
    return null;
  }

  return (
    <CommunityHub
      locale={localeParam as Locale}
      initialTab={resolvedSearchParams?.tab ?? null}
    />
  );
}
