"use client";

import type { ReactNode } from "react";

import { ClientErrorBoundary } from "@/components/client-error-boundary";

/**
 * Isolates page content from fatal client errors so header/footer stay usable.
 */
export function MainErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ClientErrorBoundary
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center bg-background px-6 py-20 text-center">
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            This part of the page could not be displayed. You can try reloading.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-bright transition hover:border-cyan-400/35 hover:bg-white/[0.1]"
          >
            Reload page
          </button>
        </div>
      }
    >
      {children}
    </ClientErrorBoundary>
  );
}
