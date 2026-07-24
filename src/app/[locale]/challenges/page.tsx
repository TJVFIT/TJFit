import { isLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function ChallengesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  redirect(`/${locale}/community?tab=challenges`);
}
