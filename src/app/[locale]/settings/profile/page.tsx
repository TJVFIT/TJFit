import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProtectedRoute } from "@/components/protected-route";
import { requireLocaleParam } from "@/lib/require-locale";
import { requireAuthenticatedUser } from "@/lib/require-authenticated-server";

export default async function SettingsProfilePage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  await requireAuthenticatedUser(locale, `/${locale}/settings/profile`);

  return (
    <ProtectedRoute locale={locale}>
      <ProfileEditForm locale={locale} />
    </ProtectedRoute>
  );
}
