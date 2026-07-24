import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

import { VerifyEmailClient } from "./verify-email-client";

export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const routeParams = await params;
  if (!isLocale(routeParams?.locale ?? "")) {
    notFound();
  }
  return <VerifyEmailClient params={routeParams} />;
}
