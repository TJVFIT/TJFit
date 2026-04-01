import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProtectedRoute } from "@/components/protected-route";
import { requireLocaleParam } from "@/lib/require-locale";

export default function ProfileEditPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  return (
    <ProtectedRoute locale={locale}>
      <ProfileEditForm locale={locale} />
    </ProtectedRoute>
  );
}
