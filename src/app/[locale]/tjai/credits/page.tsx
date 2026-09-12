import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { requireLocaleParam } from "@/lib/require-locale";

/** New pack sales are closed. Existing balances remain available through TJAI. */
export default async function TjaiCreditsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <TjaiPublicLanding locale={requireLocaleParam((await params).locale)} />;
}
