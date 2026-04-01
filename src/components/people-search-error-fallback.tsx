"use client";

import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";

export function PeopleSearchErrorFallback({ locale }: { locale: Locale }) {
  const s = getSocialCopy(locale);
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm text-zinc-400">{s.errorGeneric}</p>
      <button
        type="button"
        className="mt-6 rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:border-white/25"
        onClick={() => window.location.reload()}
      >
        {s.retryLabel}
      </button>
    </div>
  );
}
