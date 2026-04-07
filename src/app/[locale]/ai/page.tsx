import { redirect } from "next/navigation";

import { TJAIHub } from "@/components/tjai/tjai-hub";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireLocaleParam } from "@/lib/require-locale";

export const dynamic = "force-dynamic";

export default async function AiPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    redirect(`/${locale}/login?redirect=/${locale}/ai`);
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user?.id) {
    redirect(`/${locale}/login?redirect=/${locale}/ai`);
  }

  return <TJAIHub locale={locale} />;
}
