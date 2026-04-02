"use client";

import { Suspense } from "react";
import type { Locale } from "@/lib/i18n";
import { UrlNoticeToaster } from "@/components/url-notice-toaster";

export function ShellNoticeGate({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={null}>
      <UrlNoticeToaster locale={locale} />
    </Suspense>
  );
}
