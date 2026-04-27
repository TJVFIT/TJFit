import { NextResponse } from "next/server";

import { BADGE_CATALOG, listAwardedBadges } from "@/lib/tjai/badges";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const awarded = await listAwardedBadges(auth.supabase, auth.user.id);
  return NextResponse.json({
    awarded: awarded.map((row) => ({ ...BADGE_CATALOG[row.code], awarded_at: row.awarded_at })),
    catalog: Object.values(BADGE_CATALOG)
  });
}
