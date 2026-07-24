import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { PeopleSearchErrorFallback } from "@/components/people-search-error-fallback";
import { PeopleSearchView } from "@/components/people-search-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ProfileSearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);

  return (
    <ClientErrorBoundary fallback={<PeopleSearchErrorFallback locale={locale} />} sentryScope="profile-search">
      <PeopleSearchView locale={locale} />
    </ClientErrorBoundary>
  );
}
