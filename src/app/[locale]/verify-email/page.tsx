import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

import { VerifyEmailClient } from "./verify-email-client";

export default function VerifyEmailPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params?.locale ?? "")) {
    notFound();
  }
  return <VerifyEmailClient params={params} />;
}
