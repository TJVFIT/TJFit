import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default function PeopleSearchRedirect({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  redirect(`/${locale}/profile/search`);
}
