"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ParticleField } from "@/components/particle-field";
import { isLocale, type Locale } from "@/lib/i18n";

const COPY: Record<Locale, { heading: string; sub: string; refresh: string; back: string }> = {
  en: {
    heading: "Something went wrong",
    sub: "Our team has been notified. Please try again.",
    refresh: "Refresh Page",
    back: "Back to TJFit"
  },
  tr: {
    heading: "Bir sorun oluştu",
    sub: "Ekibimiz bilgilendirildi. Lütfen tekrar deneyin.",
    refresh: "Sayfayı Yenile",
    back: "TJFit'e Dön"
  },
  ar: {
    heading: "حدث خطأ ما",
    sub: "تم إبلاغ فريقنا. يرجى المحاولة مرة أخرى.",
    refresh: "تحديث الصفحة",
    back: "العودة إلى TJFit"
  },
  es: {
    heading: "Algo salió mal",
    sub: "Nuestro equipo fue notificado. Inténtalo otra vez.",
    refresh: "Actualizar página",
    back: "Volver a TJFit"
  },
  fr: {
    heading: "Une erreur est survenue",
    sub: "Notre équipe a été notifiée. Veuillez réessayer.",
    refresh: "Rafraîchir la page",
    back: "Retour à TJFit"
  }
};

export default function LocaleError({
  error,
  reset: _reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _reset;
  const pathname = usePathname() || "/en";
  const first = pathname.split("/").filter(Boolean)[0] ?? "en";
  const locale = (isLocale(first) ? first : "en") as Locale;
  const homeHref = `/${locale}`;
  const c = COPY[locale] ?? COPY.en;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[locale error]", error);
    }
  }, [error]);

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <ParticleField className="pointer-events-none absolute inset-0 opacity-20" />
      <LogoMark />
      <p className="text-[clamp(6rem,20vw,120px)] font-extrabold leading-none text-danger">500</p>
      <h1 className="mt-2 text-3xl font-bold text-white">{c.heading}</h1>
      <p className="mt-3 max-w-md text-sm text-muted sm:text-base">{c.sub}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-purple-400/30 bg-purple-400/10 px-6 py-2.5 text-sm font-semibold text-purple-200 transition-colors hover:border-purple-400/50 hover:text-white"
        >
          {c.refresh}
        </button>
        <Link
          href={homeHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-bright transition-colors hover:border-white/25 hover:text-white"
        >
          {c.back}
        </Link>
      </div>
    </section>
  );
}

function LogoMark() {
  return (
    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
      <span className="text-xl font-bold text-white">TJ</span>
    </div>
  );
}
