import type { Metadata } from "next";
import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { requireLocaleParam } from "@/lib/require-locale";
import { PUBLIC_COPY } from "@/lib/public-offers-copy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = requireLocaleParam((await params).locale);
  return { title: `TJAI | ${PUBLIC_COPY[locale].tjai.detail}`, description: PUBLIC_COPY[locale].passIntro };
}
export default async function ProPage({ params }: { params: Promise<{ locale: string }> }) {
  return <TjaiPublicLanding locale={requireLocaleParam((await params).locale)} />;
}
