import { Suspense } from "react";
import { DashboardRoleRouter } from "@/components/dashboard-role-router";
import { ProtectedRoute } from "@/components/protected-route";
import { gateDashboardForCoachTerms } from "@/lib/coach-area-server";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  await gateDashboardForCoachTerms(locale);
  return (
    <ProtectedRoute locale={locale}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Suspense
          fallback={
            <div className="space-y-8" aria-busy="true">
              <div className="tj-skeleton tj-shimmer h-[120px] w-full rounded-[20px]" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="tj-skeleton tj-shimmer min-h-[48px] w-full rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="tj-skeleton tj-shimmer h-20 rounded-xl" />
                ))}
              </div>
            </div>
          }
        >
          <DashboardRoleRouter locale={locale} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
