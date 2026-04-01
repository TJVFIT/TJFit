import { CoachDashboardView } from "@/components/coach-dashboard-view";
import { ProtectedRoute } from "@/components/protected-route";
import { requireLocaleParam } from "@/lib/require-locale";

export default function CoachDashboardPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  return (
    <ProtectedRoute locale={locale}>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <CoachDashboardView locale={locale} />
      </div>
    </ProtectedRoute>
  );
}
