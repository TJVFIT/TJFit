import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// v5 round 2 Task 4 — drives the consume_tjai_credit RPC for the
// current admin user (or for a target user if `targetUserId` is
// supplied). Verifies decrement + ledger row insertion.
//
// POST body: { targetUserId?: string, reason?: string }

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  let isAdminByRole = false;
  if (!isAdminByEmail) {
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();
    isAdminByRole = profile?.role === "admin";
  }
  if (!isAdminByEmail && !isAdminByRole) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { targetUserId?: string; reason?: string }
    | null;

  const userId = body?.targetUserId?.trim() || auth.user.id;
  const reason = body?.reason?.trim() || "test";

  // Snapshot before
  const { data: beforeProfile } = await admin
    .from("profiles")
    .select("tjai_credit_balance")
    .eq("id", userId)
    .maybeSingle();
  const balanceBefore = beforeProfile?.tjai_credit_balance ?? 0;

  const { data: rpcRows, error: rpcErr } = await admin.rpc("consume_tjai_credit", {
    p_user_id: userId,
    p_amount: 1,
    p_reason: reason,
    p_metadata: { source: "admin_test_endpoint" }
  });
  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message, code: rpcErr.code }, { status: 500 });
  }
  const result = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as
    | { balance_after?: number; ok?: boolean; reason?: string }
    | null;

  // Snapshot after
  const { data: afterProfile } = await admin
    .from("profiles")
    .select("tjai_credit_balance")
    .eq("id", userId)
    .maybeSingle();
  const balanceAfter = afterProfile?.tjai_credit_balance ?? 0;

  const { data: txn } = await admin
    .from("tjai_credit_transactions")
    .select("id, amount, balance_after, reason, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  return NextResponse.json({
    rpcResult: result,
    verification: {
      balanceBefore,
      balanceAfter,
      delta: balanceAfter - balanceBefore,
      latestTransaction: txn?.[0] ?? null,
      pass:
        Boolean(result?.ok) &&
        balanceAfter === balanceBefore - 1 &&
        txn?.[0]?.amount === -1 &&
        txn?.[0]?.reason === reason
    }
  });
}
