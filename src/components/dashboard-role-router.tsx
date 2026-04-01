"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { AdminDashboardView } from "./admin-dashboard-view";
import { CoachDashboardView } from "./coach-dashboard-view";
import { useAuth } from "./auth-provider";

export function DashboardRoleRouter({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const { role } = useAuth();
  const canViewAdmin = role === "admin";
  const canViewCoach = role === "coach" || role === "admin";
  const labels: Record<Locale, { asCoach: string; asAdmin: string; userHint: string }> = {
    en: {
      asCoach: "View as Coach",
      asAdmin: "View as Admin",
      userHint: "Use the Progress page to track your journey."
    },
    tr: {
      asCoach: "Koç olarak gor",
      asAdmin: "Admin olarak gor",
      userHint: "Yolculugunu takip etmek icin Ilerleme sayfasini kullan."
    },
    ar: {
      asCoach: "عرض كمدرب",
      asAdmin: "عرض كمسؤول",
      userHint: "استخدم صفحة التقدم لتتبع رحلتك."
    },
    es: {
      asCoach: "Ver como coach",
      asAdmin: "Ver como admin",
      userHint: "Usa la pagina de progreso para seguir tu avance."
    },
    fr: {
      asCoach: "Voir en coach",
      asAdmin: "Voir en admin",
      userHint: "Utilise la page progression pour suivre ton parcours."
    }
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
        <div className="glass-panel rounded-[24px] p-6">
          <p className="text-sm text-zinc-400">{t.userHint}</p>
        </div>
      )}
    </div>
  );
}
