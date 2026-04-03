"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthRequiredPanel } from "@/components/auth-required-panel";
import { useAuth } from "@/components/auth-provider";
import { getAuthCopy } from "@/lib/launch-copy";
import { isLocale, type Locale } from "@/lib/i18n";
import { URL_NOTICE } from "@/lib/url-notice";

type Props = {
  children: React.ReactNode;
  locale: string;
  requireAdmin?: boolean;
};

export function ProtectedRoute({ children, locale, requireAdmin }: Props) {
  const { user, role, loading, sessionCheckFailed } = useAuth();
  const router = useRouter();
  const loc = isLocale(locale) ? (locale as Locale) : "en";
  const authCopy = getAuthCopy(loc);

  const loadingText: Record<string, string> = {
    en: "Loading...",
    tr: "Yukleniyor...",
    ar: "جار التحميل...",
    es: "Cargando...",
    fr: "Chargement..."
  };

  useEffect(() => {
    if (loading || !user) return;
    if (requireAdmin && role !== "admin") {
      router.replace(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_ADMIN}`);
    }
  }, [user, role, loading, locale, requireAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">{loadingText[locale] ?? loadingText.en}</p>
      </div>
    );
  }

  if (!user && sessionCheckFailed) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
        <p className="max-w-md text-sm text-[#A1A1AA]">{authCopy.sessionCheckFailed}</p>
        <button
          type="button"
          className="mt-6 rounded-full border border-white/15 bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-cyan-400/35"
          onClick={() => window.location.reload()}
        >
          {locale === "tr" ? "Yenile" : locale === "ar" ? "تحديث" : locale === "es" ? "Actualizar" : locale === "fr" ? "Actualiser" : "Refresh"}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
        <AuthRequiredPanel locale={locale} className="w-full" />
      </div>
    );
  }

  if (requireAdmin && role !== "admin") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-zinc-400">{loadingText[locale] ?? loadingText.en}</p>
      </div>
    );
  }

  return <>{children}</>;
}
