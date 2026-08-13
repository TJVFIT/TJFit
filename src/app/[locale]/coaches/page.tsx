import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { CoachesErrorFallback } from "@/components/coaches-error-fallback";
import { CoachesListView } from "@/components/coaches-list-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default function CoachesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  return (
    <ClientErrorBoundary fallback={<CoachesErrorFallback locale={locale} />} sentryScope="coaches-list">
      <CoachesListView locale={locale} />
    </ClientErrorBoundary>
  );
}
