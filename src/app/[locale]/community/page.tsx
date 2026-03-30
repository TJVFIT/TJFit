import { isLocale } from "@/lib/i18n";
import { CommunityHub } from "@/components/community-hub";

export default function CommunityPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <CommunityHub />
  );
}
