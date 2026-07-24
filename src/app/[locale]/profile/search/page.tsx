import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { PeopleSearchErrorFallback } from "@/components/people-search-error-fallback";
import { PeopleSearchView } from "@/components/people-search-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default function ProfileSearchPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  return (
    <ClientErrorBoundary fallback={<PeopleSearchErrorFallback locale={locale} />} sentryScope="profile-search">
      <PeopleSearchView locale={locale} />
    </ClientErrorBoundary>
  );
}
