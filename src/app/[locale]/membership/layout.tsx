import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDirection, isLocale, type Locale } from "@/lib/i18n";
import { PUBLIC_COPY } from "@/lib/public-offers-copy";

export async function generateMetadata(props: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const params = await props.params;
  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) return {};
  const locale = raw as Locale;
  return { title: `TJAI | ${PUBLIC_COPY[locale].tjai.detail}`, description: PUBLIC_COPY[locale].passIntro };
}

export default async function MembershipLayout(
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
