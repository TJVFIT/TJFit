import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin();
  if (!adminResult.ok) return adminResult.response;
  const admin = adminResult.supabase;

  const body = (await request.json().catch(() => null)) as { action?: "approve" | "reject" } | null;
  const action = body?.action;
  // Strict allowlist — only approve/reject are valid moderation outcomes for
  // a pending transformation; anything else is rejected up front rather than
  // falling through to an unintended branch.
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const id = params.id;
  const { data: transformation, error: fetchError } = await admin
    .from("user_transformations")
    .select("id,status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    if (isMissingSchemaMigrationError(fetchError.message)) {
      return jsonSchemaNotReady("api/community/transformations/[id]/moderate:POST", fetchError.message);
    }
    console.error("[community/transformations/moderate] fetch failed", fetchError.message);
    return NextResponse.json({ error: "Failed to load transformation." }, { status: 500 });
  }
  if (!transformation) {
    return NextResponse.json({ error: "Transformation not found" }, { status: 404 });
  }

  if (action === "approve") {
    // Idempotency: re-approving an already-approved row must not clobber
    // approved_at (a re-click shouldn't reset the visible "approved since").
    if (transformation.status === "approved") {
      return NextResponse.json({ ok: true, alreadyApproved: true });
    }
    const { error: updateError } = await admin
      .from("user_transformations")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      console.error("[community/transformations/moderate] approve failed", updateError.message);
      return NextResponse.json({ error: "Failed to approve." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // action === "reject"
  if (transformation.status === "rejected") {
    return NextResponse.json({ ok: true, alreadyRejected: true });
  }
  const { error: rejectError } = await admin
    .from("user_transformations")
    .update({ status: "rejected" })
    .eq("id", id);
  if (rejectError) {
    console.error("[community/transformations/moderate] reject failed", rejectError.message);
    return NextResponse.json({ error: "Failed to reject." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
