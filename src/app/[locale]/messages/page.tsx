import { MessagesInboxHome } from "@/components/messages-inbox-home";
import { requireLocaleParam } from "@/lib/require-locale";

export default function MessagesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return <MessagesInboxHome locale={locale} />;
}
