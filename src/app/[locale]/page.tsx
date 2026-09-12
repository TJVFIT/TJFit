import { PublicHome } from "@/components/public-home";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PublicHome locale={requireLocaleParam(locale)} />;
}
