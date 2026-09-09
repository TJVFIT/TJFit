import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

import { VerifyEmailClient } from "./verify-email-client";

export default async function VerifyEmailPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params?.locale ?? "")) {
    notFound();
  }
  return <VerifyEmailClient params={params} />;
}
