import { NextRequest, NextResponse } from "next/server";

export type ProspectData = {
  businessName: string;
  website: string;
  previewImageUrl: string;
  tier: "free" | "paid";
  city: string;
  industry: string;
  status: "pending" | "signed_up" | "expired";
  alreadyActivated?: boolean;
};

async function fetchProspect(token: string): Promise<ProspectData | null> {
  const webhookUrl = process.env.N8N_PROSPECT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("N8N_PROSPECT_WEBHOOK_URL not configured");
    return null;
  }

  try {
    const res = await fetch(`${webhookUrl}?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || !data.businessName) return null;

    return {
      businessName: data.businessName,
      website: data.website,
      previewImageUrl: data.previewImageUrl || "",
      tier: data.tier === "paid" ? "paid" : "free",
      city: data.city || "",
      industry: data.industry || "",
      status: data.status || "pending",
      alreadyActivated: data.status === "signed_up",
    };
  } catch (err) {
    console.error("Failed to fetch prospect data:", err);
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 8) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 400 }
    );
  }

  const prospect = await fetchProspect(token);

  if (!prospect) {
    return NextResponse.json(
      { error: "Token not found or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json(prospect);
}
