"use client";

/**
 * Root error UI when the root layout fails. Must include <html> and <body> (Next.js requirement).
 */
export default function GlobalError({
  error: _error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0B] font-sans antialiased text-zinc-300">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            Something went wrong. Please try again or return to the site in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-zinc-100"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
