import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { PeopleSearchErrorFallback } from "@/components/people-search-error-fallback";
import { PeopleSearchView } from "@/components/people-search-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ProfileSearchPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);

  return (
    <ClientErrorBoundary fallback={<PeopleSearchErrorFallback locale={locale} />} sentryScope="profile-search">
      <PeopleSearchView locale={locale} />
    </ClientErrorBoundary>
  );
}
