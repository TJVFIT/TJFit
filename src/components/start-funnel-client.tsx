import { PublicHome } from "@/components/public-home";
import type { Locale } from "@/lib/i18n";

export function StartFunnelClient({ locale }: { locale: Locale }) {
  return <PublicHome locale={locale} />;
}
