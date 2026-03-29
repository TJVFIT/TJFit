import { ProtectedRoute } from "@/components/protected-route";
import { ProgressView } from "@/components/progress-view";
import { isLocale, type Locale } from "@/lib/i18n";

export default function ProgressPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <ProtectedRoute locale={params.locale}>
      <ProgressView locale={params.locale as Locale} />
    </ProtectedRoute>
  );
}

