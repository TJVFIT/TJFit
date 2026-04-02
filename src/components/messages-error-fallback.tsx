"use client";

import { getMessagesCopy } from "@/lib/feature-copy";
import type { Locale } from "@/lib/i18n";

export function MessagesErrorFallback({ locale }: { locale: Locale }) {
  const t = getMessagesCopy(locale);
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="tj-empty-state w-full max-w-md">
        <p className="tj-empty-state__text">{t.chatUnavailable}</p>
        <button type="button" className="tj-btn-ghost mt-6" onClick={() => window.location.reload()}>
          {t.threadRetry}
        </button>
      </div>
    </div>
  );
}
