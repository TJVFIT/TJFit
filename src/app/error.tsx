"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("TJFit route error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="page-shell grid min-h-[65dvh] place-items-center py-16 text-center">
      <div className="max-w-lg">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
          Route interrupted
        </p>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.045em] text-white">
          This section could not load.
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          Your account and purchases are unchanged. Retry the section or return to the main navigation.
        </p>
        <button
          type="button"
          onClick={reset}
          className="gradient-button mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Retry
        </button>
      </div>
    </div>
  );
}
