"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { CoachDashboardView } from "./coach-dashboard-view";
import { UserDashboardView } from "./user-dashboard-view";
import { useAuth } from "./auth-provider";

export function DashboardRoleRouter({ locale }: { locale: Locale }) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (role === "admin") {
      router.replace(`/${locale}/admin`);
    }
  }, [role, loading, locale, router]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="tj-skeleton tj-shimmer h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted">Redirecting to admin panel…</p>
      </div>
    );
  }

  if (role === "coach") {
    return <CoachDashboardView locale={locale} />;
  }

  return <UserDashboardView locale={locale} />;
}
