import { notFound } from "next/navigation";
import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { MessagesErrorFallback } from "@/components/messages-error-fallback";
import { MessagesLayoutShell } from "@/components/messages-layout-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { isLocale, type Locale } from "@/lib/i18n";
import { requireAuthenticatedUser } from "@/lib/require-authenticated-server";

export default async function MessagesLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  await requireAuthenticatedUser(locale, `/${locale}/messages`);

  return (
    <ProtectedRoute locale={locale}>
      <ClientErrorBoundary fallback={<MessagesErrorFallback locale={locale} />} sentryScope="messages">
        <MessagesLayoutShell locale={locale}>{children}</MessagesLayoutShell>
      </ClientErrorBoundary>
    </ProtectedRoute>
  );
}
