import { permanentRedirect } from "next/navigation";

import { requireSupportedLocaleParam } from "@/lib/require-locale";

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireSupportedLocaleParam((await params).locale);
  permanentRedirect(`/${locale}/store`);
}
