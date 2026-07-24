import { ProtectedRoute } from "@/components/protected-route";
import { ProgressView } from "@/components/progress-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);

  return (
    <ProtectedRoute locale={locale}>
      <ProgressView locale={locale} />
    </ProtectedRoute>
  );
}

