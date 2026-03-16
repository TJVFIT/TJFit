"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { AdminDashboardView } from "./admin-dashboard-view";
import { CoachDashboardView } from "./coach-dashboard-view";

export function DashboardRoleRouter({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "admin") {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm text-zinc-400 hover:text-white"
          >
            View as Coach
          </Link>
        </div>
        <AdminDashboardView locale={locale} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={`/${locale}/dashboard?view=admin`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          View as Admin
        </Link>
      </div>
      <CoachDashboardView locale={locale} />
    </div>
  );
}
