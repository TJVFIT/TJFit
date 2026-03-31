"use client";

import { useEffect } from "react";

/**
 * Locale segment error UI — keeps shell chrome from parent layout; recover without full reload when possible.
 */
export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[locale error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[#0A0A0B] px-6 py-20 text-center">
      <p className="max-w-md text-sm leading-relaxed text-zinc-400">
        Something went wrong loading this page. You can try again or return home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-cyan-400/35 hover:bg-white/[0.1]"
        >
          Try again
        </button>
        <a
          href="/en"
          className="rounded-full border border-transparent px-6 py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          Home (EN)
        </a>
      </div>
    </div>
  );
}
