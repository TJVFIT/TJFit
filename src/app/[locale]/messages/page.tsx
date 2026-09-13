import { MessagesInboxHome } from "@/components/messages-inbox-home";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function MessagesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  return <MessagesInboxHome locale={locale} />;
}
