import { ProtectedRoute } from "@/components/protected-route";
import { ProgressView } from "@/components/progress-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ProgressPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);

  return (
    <ProtectedRoute locale={locale}>
      <ProgressView locale={locale} />
    </ProtectedRoute>
  );
}

