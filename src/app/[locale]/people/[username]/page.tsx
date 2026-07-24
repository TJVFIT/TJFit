import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default function PeopleUsernameRedirect({
  params
}: {
  params: { locale: string; username: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const username = params.username ?? "";
  redirect(`/${locale}/profile/${encodeURIComponent(username)}`);
}
