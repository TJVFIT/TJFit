"use client";

import {useEffect, useState} from "react";
import {RECOVERY_COPY, recoveryLocale} from "@/components/main-error-boundary";
import {getDirection, type Locale} from "@/lib/i18n";

export default function GlobalError({
  error: _error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // A failed root layout may not provide Next router context. Read the browser
  // location after hydration so the fallback never depends on that context.
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(recoveryLocale(window.location.pathname)); }, []);
  const t = RECOVERY_COPY[locale];
  return (
    <html lang={locale} dir={getDirection(locale)}>
      <body className="min-h-screen bg-background font-sans antialiased text-bright">
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_72%)]"
            aria-hidden
          />
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <p className="mt-3 max-w-md text-sm text-muted sm:text-base">
            {t.message}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-purple-400/30 bg-purple-400/10 px-6 py-2.5 text-sm font-semibold text-purple-200 transition-colors hover:border-purple-400/50 hover:text-white"
            >
              {t.retry}
            </button>
            <a
              href={`/${locale}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-bright transition-colors hover:border-white/25 hover:text-white"
            >
              {t.home}
            </a>
          </div>
        </section>
      </body>
    </html>
  );
}
