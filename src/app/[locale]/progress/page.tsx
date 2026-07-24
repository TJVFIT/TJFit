import { ProtectedRoute } from "@/components/protected-route";
import { ProgressView } from "@/components/progress-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default function ProgressPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  return (
    <ProtectedRoute locale={locale}>
      <ProgressView locale={locale} />
    </ProtectedRoute>
  );
}

