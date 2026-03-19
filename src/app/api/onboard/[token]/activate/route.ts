import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { token } = await params;

  if (!token || token.length < 8) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.N8N_PROSPECT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        event: "activated",
        email: session.user.email,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.error("Activation webhook failed:", res.status);
      return NextResponse.json(
        { error: "Activation failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: `/onboard/${token}/connect`,
    });
  } catch (err) {
    console.error("Activation webhook error:", err);
    return NextResponse.json(
      { error: "Activation service unavailable" },
      { status: 502 }
    );
  }
}
