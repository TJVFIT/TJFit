import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDirection, isLocale, type Locale } from "@/lib/i18n";
import { getRouteSeo } from "@/lib/route-seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (typeof raw !== "string" || !isLocale(raw)) return {};
  const locale = raw as Locale;
  return getRouteSeo(locale, "calculator");
}

export default async function CalculatorLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (typeof raw !== "string" || !isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  return <div dir={getDirection(locale)}>{children}</div>;
}
