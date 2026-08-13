"use client";

import { EmptyState } from "@/components/ui/empty-state";
import type { Locale } from "@/lib/i18n";

const COPY: Record<Locale, { message: string; retry: string }> = {
  en: { message: "Something went wrong loading coaches.", retry: "Try again" },
  tr: { message: "Koçlar yüklenirken bir sorun oluştu.", retry: "Tekrar dene" },
  ar: { message: "حدث خطأ أثناء تحميل المدربين.", retry: "أعد المحاولة" },
  es: { message: "Ocurrió un error al cargar los coaches.", retry: "Reintentar" },
  fr: { message: "Une erreur est survenue lors du chargement des coachs.", retry: "Réessayer" }
};

export function CoachesErrorFallback({ locale }: { locale: Locale }) {
  const c = COPY[locale] ?? COPY.en;
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <EmptyState
        className="w-full max-w-md"
        subtext={c.message}
        cta={
          <button type="button" className="tj-btn-ghost mt-6" onClick={() => window.location.reload()}>
            {c.retry}
          </button>
        }
      />
    </div>
  );
}
