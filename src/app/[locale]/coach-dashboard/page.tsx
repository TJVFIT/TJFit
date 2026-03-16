import { isLocale, type Locale } from "@/lib/i18n";
import { CoachDashboardView } from "@/components/coach-dashboard-view";

export default function CoachDashboardPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <CoachDashboardView locale={params.locale as Locale} />
    </div>
  );
}
