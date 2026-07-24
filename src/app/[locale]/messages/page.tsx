import { MessagesInboxHome } from "@/components/messages-inbox-home";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);
  return <MessagesInboxHome locale={locale} />;
}
