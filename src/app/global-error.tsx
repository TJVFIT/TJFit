"use client";

import Link from "next/link";

export default function GlobalError({
  error: _error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#09090B] font-sans antialiased text-zinc-300">
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.06)_0%,transparent_72%)]"
            aria-hidden
          />
          <h1 className="text-3xl font-bold text-white">Something went wrong.</h1>
          <p className="mt-3 max-w-md text-sm text-[#A1A1AA] sm:text-base">
            An unexpected error occurred. Please try again.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-400/50 hover:text-white"
            >
              Try Again
            </button>
            <Link
              href="/en"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
            >
              ? Back to TJFit
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}
