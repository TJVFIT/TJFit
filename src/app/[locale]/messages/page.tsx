import { MessagesView } from "@/components/messages-view";
import { ProtectedRoute } from "@/components/protected-route";
import { isLocale, type Locale } from "@/lib/i18n";

export default function MessagesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return null;

  return (
    <ProtectedRoute locale={params.locale}>
      <MessagesView locale={params.locale as Locale} />
    </ProtectedRoute>
  );
}

