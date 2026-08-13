"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";

export function PeopleSearchErrorFallback({ locale }: { locale: Locale }) {
  const s = getSocialCopy(locale);
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <EmptyState
        className="w-full max-w-md"
        subtext={s.errorGeneric}
        cta={
          <button type="button" className="tj-btn-ghost mt-6" onClick={() => window.location.reload()}>
            {s.retryLabel}
          </button>
        }
      />
    </div>
  );
}
