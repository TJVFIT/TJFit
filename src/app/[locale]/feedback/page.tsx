import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function FeedbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }
  redirect(`/${locale}/support`);
}
