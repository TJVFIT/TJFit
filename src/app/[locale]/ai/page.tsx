import { redirect } from "next/navigation";

import { TJAIHub } from "@/components/tjai/tjai-hub";
import { isAdminEmail } from "@/lib/auth-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTJAIAccess } from "@/lib/tjai-access";
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
      redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`);
    }

    const isAdminByEmail = Boolean(user.email && isAdminEmail(user.email));
    const [{ data: sub }, { data: usage }, { data: purchase }, { data: profile }] = await Promise.all([
      supabase.from("user_subscriptions").select("tier").eq("user_id", user.id).maybeSingle(),
      supabase.from("tjai_trial_usage").select("messages_used").eq("user_id", user.id).maybeSingle(),
      supabase.from("tjai_plan_purchases").select("id").eq("user_id", user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
      isAdminByEmail ? Promise.resolve({ data: { role: "admin" } }) : supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    ]);
    const isAdmin = isAdminByEmail || profile?.role === "admin";
    const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
    const remaining = isAdmin ? 999 : Math.max(0, 10 - Number(usage?.messages_used ?? 0));
    const access = getTJAIAccess(tier, {
      hasOneTimePlanPurchase: Boolean(purchase?.id),
      coreTrialMessagesRemaining: remaining,
      isAdmin
    });

    if (!access.canGeneratePlan) {
      redirect(`/${locale}/tjai`);
    }

    return <TJAIHub locale={locale} />;
  } catch {
    redirect(`/${locale}/tjai`);
  }
}
