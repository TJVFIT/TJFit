import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProtectedRoute } from "@/components/protected-route";
import { requireLocaleParam } from "@/lib/require-locale";
import { requireAuthenticatedUser } from "@/lib/require-authenticated-server";

export default async function ProfileEditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);
  await requireAuthenticatedUser(locale, `/${locale}/profile/edit`);

  return (
    <ProtectedRoute locale={locale}>
      <ProfileEditForm locale={locale} />
    </ProtectedRoute>
  );
}
