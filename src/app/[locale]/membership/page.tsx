import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  return <TjaiPublicLanding locale={requireLocaleParam((await params).locale)} />;
}
