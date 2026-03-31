import { Suspense } from "react";
import { DashboardRoleRouter } from "@/components/dashboard-role-router";
import { ProtectedRoute } from "@/components/protected-route";
import { isLocale, type Locale } from "@/lib/i18n";

export default function DashboardPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }
  return (
    <ProtectedRoute locale={params.locale}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 w-56 animate-pulse rounded-lg bg-white/[0.06]" />
              <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]" />
            </div>
          }
        >
          <DashboardRoleRouter locale={params.locale as Locale} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
