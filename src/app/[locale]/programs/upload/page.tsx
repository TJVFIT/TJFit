import { ProgramUploadClient } from "@/components/program-upload-client";
import { gateCoachOrAdminRoute } from "@/lib/coach-area-server";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ProgramUploadPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  await gateCoachOrAdminRoute(locale, `/${locale}/programs/upload`);
  return <ProgramUploadClient locale={locale} />;
}
