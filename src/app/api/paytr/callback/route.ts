import { NextRequest, NextResponse } from "next/server";

import { verifyPaytrCallback } from "@/lib/paytr";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const merchantOid = String(formData.get("merchant_oid") ?? "");
    const status = String(formData.get("status") ?? "");
    const totalAmount = String(formData.get("total_amount") ?? "");
    const hash = String(formData.get("hash") ?? "");

    if (!merchantOid || !status || !totalAmount || !hash) {
      return new NextResponse("Missing callback fields", { status: 400 });
    }

    const isValid = verifyPaytrCallback({
      merchantOid,
      status,
      totalAmount,
      hash
    });

    if (!isValid) {
      return new NextResponse("Invalid callback signature", { status: 400 });
    }

    // Persist booking status, earnings split, and user notifications here.
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Callback failed", {
      status: 500
    });
  }
}
