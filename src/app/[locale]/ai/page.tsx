import { ComingSoonLaunchPage } from "@/components/coming-soon-launch-page";
import { TJAIHub } from "@/components/tjai/tjai-hub";
import { resolveEffectiveServerRole } from "@/lib/coach-area-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireLocaleParam } from "@/lib/require-locale";

export const dynamic = "force-dynamic";

export default async function AiPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return <ComingSoonLaunchPage locale={locale} page="ai" source="tjai-coming-soon-ai" />;
    }

    const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
    if (role !== "admin") {
      return <ComingSoonLaunchPage locale={locale} page="ai" source="tjai-coming-soon-ai" />;
    }

    return <TJAIHub locale={locale} />;
  } catch {
    return <ComingSoonLaunchPage locale={locale} page="ai" source="tjai-coming-soon-ai" />;
  }
}
