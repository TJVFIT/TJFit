import { notFound } from "next/navigation";
import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { MessagesErrorFallback } from "@/components/messages-error-fallback";
import { MessagesLayoutShell } from "@/components/messages-layout-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { isLocale, type Locale } from "@/lib/i18n";

export default function MessagesLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;

  return (
    <ProtectedRoute locale={locale}>
      <ClientErrorBoundary fallback={<MessagesErrorFallback locale={locale} />} sentryScope="messages">
        <MessagesLayoutShell locale={locale}>{children}</MessagesLayoutShell>
      </ClientErrorBoundary>
    </ProtectedRoute>
  );
}
