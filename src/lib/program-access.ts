import type { Program } from "@/lib/content";
import { isAdminEmail } from "@/lib/auth-utils";
import { hasPurchasedProgram } from "@/lib/purchases";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getOptionalServerUser(): Promise<
  { userId: string; role: "admin" | "coach" | "user"; supabase: ReturnType<typeof createServerSupabaseClient> } | null
> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    if (error || !user?.id) return null;
    if (user.email && isAdminEmail(user.email)) {
      return { userId: user.id, role: "admin", supabase };
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = profile?.role === "admin" ? "admin" : profile?.role === "coach" ? "coach" : "user";
    return { userId: user.id, role, supabase };
  } catch {
    return null;
  }
}

export async function userHasPaidProgram(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  programSlug: string
): Promise<boolean> {
  return hasPurchasedProgram(supabase, userId, programSlug);
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
  hasPaidOrder: boolean,
  isAdmin = false
): ProgramDetailAccess {
  if (isAdmin) {
    return {
      showFullFreeContent: true,
      showFullPaidContent: true,
      needsSignupForFree: false,
      needsPurchaseForPaid: false
    };
  }
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
