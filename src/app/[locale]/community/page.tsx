import { CommunityHub } from "@/components/community-hub";
import { requireLocaleParam } from "@/lib/require-locale";

export default function CommunityPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { tab?: string };
}) {
  const locale = requireLocaleParam(params.locale);

  return <CommunityHub locale={locale} initialTab={searchParams?.tab ?? null} />;
}
