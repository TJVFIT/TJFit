import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { isAdminEmail } from "@/lib/auth-utils";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { URL_NOTICE } from "@/lib/url-notice";

export default async function AdminLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);

  let authClient: ReturnType<typeof createServerSupabaseClient>;
  try {
    authClient = createServerSupabaseClient();
  } catch {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`);
  }

  const {
    data: { user }
  } = await authClient.auth.getUser();
  if (!user?.email) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`);
  }

  const isAdmin =
    isAdminEmail(user.email) ||
    (await authClient.from("profiles").select("role").eq("id", user.id).single()).data?.role === "admin";

  if (!isAdmin) {
    redirect(`/${locale}/dashboard?notice=${URL_NOTICE.FORBIDDEN_ADMIN}`);
  }

  return <>{children}</>;
}
