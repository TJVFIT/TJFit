import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDirection, isLocale, type Locale } from "@/lib/i18n";
import { getRouteSeo } from "@/lib/route-seo";

export async function generateMetadata(props: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const params = await props.params;
  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) return {};
  const locale = raw as Locale;
  return getRouteSeo(locale, "coaches");
}

export default async function CoachesLayout(
  props: {
    children: ReactNode;
    params: Promise<{ locale?: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  return <div dir={getDirection(locale)}>{children}</div>;
}
