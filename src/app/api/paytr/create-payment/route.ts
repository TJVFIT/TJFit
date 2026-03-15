import { NextRequest, NextResponse } from "next/server";

import { createPaytrToken } from "@/lib/paytr";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limiter = rateLimit({
      key:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.ip ??
        "unknown",
      limit: 20,
      windowMs: 60_000
    });

    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await request.json();

    if (!body.email || !body.merchantOid || !body.paymentAmount) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const token = createPaytrToken({
      merchantOid: body.merchantOid,
      email: body.email,
      paymentAmount: Number(body.paymentAmount),
      userIp:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.ip ??
        "127.0.0.1",
      currency: "TRY"
    });

    return NextResponse.json({
      success: true,
      token,
      paymentType: "paytr_iframe",
      note: "Use this token to initialize the PAYTR iFrame checkout."
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to create payment."
      },
      { status: 500 }
    );
  }
}
