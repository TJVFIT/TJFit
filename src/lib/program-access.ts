import type { Program } from "@/lib/content";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getOptionalServerUser(): Promise<{ userId: string; supabase: ReturnType<typeof createServerSupabaseClient> } | null> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    if (error || !user?.id) return null;
    return { userId: user.id, supabase };
  } catch {
    return null;
  }
}

export async function userHasPaidProgram(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  programSlug: string
): Promise<boolean> {
  const { data } = await supabase
    .from("program_orders")
    .select("id")
    .eq("user_id", userId)
    .eq("program_slug", programSlug)
    .eq("status", "paid")
    .maybeSingle();
  return Boolean(data);
}

export type ProgramDetailAccess = {
  /** Logged-in user may view full free starter content */
  showFullFreeContent: boolean;
  /** User purchased this paid static program */
  showFullPaidContent: boolean;
  /** Free starter but visitor is logged out */
  needsSignupForFree: boolean;
  /** Paid program without a paid order */
  needsPurchaseForPaid: boolean;
};

export function resolveStaticProgramAccess(
  program: Program | null,
  userId: string | null,
  hasPaidOrder: boolean
): ProgramDetailAccess {
  if (!program) {
    return {
      showFullFreeContent: false,
      showFullPaidContent: true,
      needsSignupForFree: false,
      needsPurchaseForPaid: false
    };
  }
  if (program.is_free) {
    const signedIn = Boolean(userId);
    return {
      showFullFreeContent: signedIn,
      showFullPaidContent: false,
      needsSignupForFree: !signedIn,
      needsPurchaseForPaid: false
    };
  }
  const showFullPaidContent = Boolean(userId) && hasPaidOrder;
  return {
    showFullFreeContent: false,
    showFullPaidContent,
    needsSignupForFree: false,
    needsPurchaseForPaid: !showFullPaidContent
  };
}
