import { NextResponse } from "next/server";

// TJCoin retired. This endpoint returned wallet balance + offer/code lists;
// it now responds 410 Gone so any stray client surfaces a clean error.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "TJCoin has been retired." },
    { status: 410 }
  );
}
