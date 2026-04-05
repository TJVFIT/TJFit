import { redirect } from "next/navigation";

import type { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Server-side session gate for protected pages (defense in depth with middleware).
 */
export async function requireAuthenticatedUser(locale: Locale, nextPathWithLocale: string) {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    redirect(`/${locale}/login?next=${encodeURIComponent(nextPathWithLocale)}`);
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user?.id) {
    redirect(`/${locale}/login?next=${encodeURIComponent(nextPathWithLocale)}`);
  }

  return { supabase, user };
}
