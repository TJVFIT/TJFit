import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function PeopleUsernameRedirect({
  params
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale: localeParam, username: usernameParam } = await params;
  const locale = requireLocaleParam(localeParam);
  const username = usernameParam ?? "";
  redirect(`/${locale}/profile/${encodeURIComponent(username)}`);
}
