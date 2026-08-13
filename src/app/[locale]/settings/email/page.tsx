import { EmailPreferencesForm } from "@/components/email-preferences-form";
import { ProtectedRoute } from "@/components/protected-route";
import { getEmailPreferencesCopy } from "@/lib/email-preferences-copy";
import { requireLocaleParam } from "@/lib/require-locale";
import { requireAuthenticatedUser } from "@/lib/require-authenticated-server";

export default async function SettingsEmailPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  await requireAuthenticatedUser(locale, `/${locale}/settings/email`);
  const copy = getEmailPreferencesCopy(locale);

  return (
    <ProtectedRoute locale={locale}>
      <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <h1 className="text-3xl font-bold text-white">{copy.title}</h1>
        <p className="text-sm text-muted">{copy.subtitle}</p>
      </section>
      <EmailPreferencesForm locale={locale} />
    </ProtectedRoute>
  );
}
