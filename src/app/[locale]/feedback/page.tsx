import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function FeedbackPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  redirect(`/${locale}/support`);
}
