import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default function TransformationsPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  redirect(`/${locale}/community?tab=transformations`);
}
