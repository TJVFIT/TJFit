import { ChatThreadView } from "@/components/chat-thread-view";
import { ProtectedRoute } from "@/components/protected-route";
import { isLocale, type Locale } from "@/lib/i18n";

export default function ConversationPage({
  params
}: {
  params: { locale: string; conversationId: string };
}) {
  if (!isLocale(params.locale)) return null;

  return (
    <ProtectedRoute locale={params.locale}>
      <ChatThreadView locale={params.locale as Locale} conversationId={params.conversationId} />
    </ProtectedRoute>
  );
}

