import { EmailPreferencesForm } from "@/components/email-preferences-form";
import { ProtectedRoute } from "@/components/protected-route";
import { requireLocaleParam } from "@/lib/require-locale";
import { requireAuthenticatedUser } from "@/lib/require-authenticated-server";

export default async function SettingsEmailPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  await requireAuthenticatedUser(locale, `/${locale}/settings/email`);

  return (
    <ProtectedRoute locale={locale}>
      <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <h1 className="text-3xl font-bold text-white">Email Preferences</h1>
        <p className="text-sm text-muted">Choose which emails TJFit sends you.</p>
      </section>
      <EmailPreferencesForm />
    </ProtectedRoute>
  );
}
