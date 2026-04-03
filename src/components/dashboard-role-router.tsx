"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { AdminDashboardView } from "./admin-dashboard-view";
import { CoachDashboardView } from "./coach-dashboard-view";
import { UserDashboardView } from "./user-dashboard-view";
import { useAuth } from "./auth-provider";

export function DashboardRoleRouter({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const { role } = useAuth();
  const canViewAdmin = role === "admin";
  const canViewCoach = role === "coach" || role === "admin";
  const labels: Record<Locale, { asCoach: string; asAdmin: string }> = {
    en: { asCoach: "View as Coach", asAdmin: "View as Admin" },
    tr: { asCoach: "Koç olarak gor", asAdmin: "Admin olarak gor" },
    ar: { asCoach: "عرض كمدرب", asAdmin: "عرض كمسؤول" },
    es: { asCoach: "Ver como coach", asAdmin: "Ver como admin" },
    fr: { asCoach: "Voir en coach", asAdmin: "Voir en admin" }
  };
  const t = labels[locale] ?? labels.en;

  if (view === "admin" && canViewAdmin) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm text-zinc-400 hover:text-white"
          >
            {t.asCoach}
          </Link>
        </div>
        <AdminDashboardView locale={locale} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canViewAdmin && (
        <div className="flex justify-end">
          <Link
            href={`/${locale}/dashboard?view=admin`}
            className="text-sm text-zinc-400 hover:text-white"
          >
            {t.asAdmin}
          </Link>
        </div>
      )}
      {canViewCoach ? (
        <CoachDashboardView locale={locale} />
      ) : (
        <UserDashboardView locale={locale} />
      )}
    </div>
  );
}
