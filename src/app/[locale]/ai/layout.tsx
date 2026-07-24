import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDirection, isLocale, type Locale } from "@/lib/i18n";
import { getRouteSeo } from "@/lib/route-seo";

export function generateMetadata({ params }: { params: { locale?: string } }): Metadata {
  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) return {};
  const locale = raw as Locale;
  return getRouteSeo(locale, "ai");
}

export default function AiLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale?: string };
}) {
  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  return <div dir={getDirection(locale)}>{children}</div>;
}
