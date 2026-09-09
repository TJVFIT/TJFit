import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function AffiliatePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  redirect(`/${locale}/become-a-coach`);
}
