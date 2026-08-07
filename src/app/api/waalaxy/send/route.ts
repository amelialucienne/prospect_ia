import { NextRequest, NextResponse } from "next/server";
import { sendLeadToWaalaxy, isWaalaxyConfigured } from "@/services/waalaxy";
import type { Lead } from "@/types/lead";

export async function POST(request: NextRequest) {
  if (!isWaalaxyConfigured()) {
    return NextResponse.json(
      { error: "Waalaxy non configuré (WAALAXY_API_KEY / WAALAXY_LIST_ID manquants)." },
      { status: 400 }
    );
  }

  const { lead } = (await request.json()) as { lead: Lead };
  if (!lead?.linkedInUrl) {
    return NextResponse.json({ error: "lead.linkedInUrl manquant" }, { status: 400 });
  }

  try {
    const result = await sendLeadToWaalaxy(lead);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Échec de l'envoi à Waalaxy", details: result.body },
        { status: 502 }
      );
    }
    return NextResponse.json({ status: "queued", details: result.body });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
