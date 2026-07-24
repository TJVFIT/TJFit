import { NextResponse } from "next/server";

// TJCoin retired. Redemption endpoint responds 410 Gone.
export async function POST() {
  return NextResponse.json(
    { error: "TJCoin has been retired." },
    { status: 410 }
  );
}
