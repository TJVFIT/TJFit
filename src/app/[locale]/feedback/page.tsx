import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default function FeedbackPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }
  redirect(`/${params.locale}/support`);
}
