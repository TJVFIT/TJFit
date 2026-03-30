import { isLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default function ChallengesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  redirect(`/${params.locale}/community?tab=challenges`);
}
