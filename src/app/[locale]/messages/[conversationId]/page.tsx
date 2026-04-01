import { notFound } from "next/navigation";
import { ChatThreadView } from "@/components/chat-thread-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default function ConversationPage({
  params
}: {
  params: { locale: string; conversationId: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const conversationId = typeof params.conversationId === "string" ? params.conversationId.trim() : "";
  if (!conversationId) {
    notFound();
  }

  return <ChatThreadView locale={locale} conversationId={conversationId} />;
}
