"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getDirection, isLocale, type Locale } from "@/lib/i18n";

import { ClientErrorBoundary } from "@/components/client-error-boundary";

export const RECOVERY_COPY = {
  en: { title: "This page could not be displayed", message: "Try loading the page again. If the problem continues, return to the homepage and try later.", reload: "Reload this page", retry: "Try loading again", home: "Back to TJFit" },
  tr: { title: "Bu sayfa görüntülenemedi", message: "Sayfayı yeniden yüklemeyi dene. Sorun sürerse ana sayfaya dön ve daha sonra tekrar dene.", reload: "Bu sayfayı yeniden yükle", retry: "Yeniden yüklemeyi dene", home: "TJFit ana sayfasına dön" },
  ar: { title: "تعذّر عرض هذه الصفحة", message: "حاول تحميل الصفحة مجدداً. إذا استمرت المشكلة، فعد إلى الصفحة الرئيسية وحاول لاحقاً.", reload: "أعد تحميل هذه الصفحة", retry: "حاول التحميل مجدداً", home: "العودة إلى TJFit" },
  es: { title: "No se pudo mostrar esta página", message: "Intenta cargar la página de nuevo. Si el problema continúa, vuelve al inicio e inténtalo más tarde.", reload: "Recargar esta página", retry: "Intentar cargar de nuevo", home: "Volver a TJFit" },
  fr: { title: "Cette page n’a pas pu être affichée", message: "Réessayez de charger la page. Si le problème persiste, revenez à l’accueil et réessayez plus tard.", reload: "Recharger cette page", retry: "Réessayer le chargement", home: "Retour à TJFit" }
} satisfies Record<Locale, Record<string, string>>;

export function recoveryLocale(pathname: string | null | undefined): Locale {
  const segment = pathname?.split("/")[1];
  return isLocale(segment ?? "") ? segment as Locale : "en";
}

export function PageRecovery({ locale, retry }: { locale: Locale; retry: () => void }) {
  const t = RECOVERY_COPY[locale];
  return <div role="alert" dir={getDirection(locale)} className="flex min-h-[50vh] flex-col items-center justify-center bg-background px-6 py-20 text-center">
    <h2 className="text-xl font-semibold text-white">{t.title}</h2>
    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{t.message}</p>
    <button type="button" onClick={retry} className="mt-8 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-bright transition hover:border-purple-400/35 hover:bg-white/[0.1]">{t.reload}</button>
  </div>;
}

/**
 * Isolates page content from fatal client errors so header/footer stay usable.
 */
export function MainErrorBoundary({ children }: { children: ReactNode }) {
  const locale = recoveryLocale(usePathname());
  return (
    <ClientErrorBoundary
      fallback={<PageRecovery locale={locale} retry={() => window.location.reload()} />}
    >
      {children}
    </ClientErrorBoundary>
  );
}
