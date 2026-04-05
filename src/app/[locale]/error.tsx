"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLocale, type Locale } from "@/lib/i18n";

const COPY: Record<Locale, { heading: string; sub: string; retry: string; back: string }> = {
  en: { heading: "Something went wrong.", sub: "An unexpected error occurred. Please try again.", retry: "Try Again", back: "Back to TJFit" },
  tr: { heading: "Bir seyler ters gitti.", sub: "Beklenmeyen bir hata olustu. Lutfen tekrar deneyin.", retry: "Tekrar Dene", back: "TJFit'e don" },
  ar: { heading: "??? ??? ??.", sub: "??? ??? ??? ?????. ???? ???????? ??? ????.", retry: "???? ??????", back: "?????? ??? TJFit" },
  es: { heading: "Algo salio mal.", sub: "Ocurrio un error inesperado. Intentalo de nuevo.", retry: "Intentar de nuevo", back: "Volver a TJFit" },
  fr: { heading: "Une erreur est survenue.", sub: "Une erreur inattendue s'est produite. Veuillez reessayer.", retry: "Reessayer", back: "Retour a TJFit" }
};

export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#09090B] px-6 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.06)_0%,transparent_72%)]"
        aria-hidden
      />
      <h1 className="text-3xl font-bold text-white">{c.heading}</h1>
      <p className="mt-3 max-w-md text-sm text-[#A1A1AA] sm:text-base">{c.sub}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-400/50 hover:text-white"
        >
          {c.retry}
        </button>
        <Link
          href={homeHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
        >
          <span className="rtl:rotate-180 inline-block">?</span> {c.back}
        </Link>
      </div>
    </section>
  );
}
