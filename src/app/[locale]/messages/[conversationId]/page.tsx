import { notFound } from "next/navigation";
import { ChatThreadView } from "@/components/chat-thread-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ConversationPage({
  params
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { locale: localeParam, conversationId: conversationIdParam } = await params;
  const locale = requireLocaleParam(localeParam);
  const conversationId = typeof conversationIdParam === "string" ? conversationIdParam.trim() : "";
  if (!conversationId) {
    notFound();
  }

  return <ChatThreadView locale={locale} conversationId={conversationId} />;
}
