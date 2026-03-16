import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n";
import { DashboardRoleRouter } from "@/components/dashboard-role-router";

export default function DashboardPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-zinc-400">Loading dashboard...</div>}>
        <DashboardRoleRouter locale={params.locale as Locale} />
      </Suspense>
    </div>
  );
}
