import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function PeopleUsernameRedirect(
  props: {
    params: Promise<{ locale: string; username: string }>;
  }
) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  const username = params.username ?? "";
  redirect(`/${locale}/profile/${encodeURIComponent(username)}`);
}
