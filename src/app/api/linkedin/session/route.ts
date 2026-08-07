import { NextResponse } from "next/server";
import { isLinkedInAutomationEnabled } from "@/lib/linkedin/config";
import { checkLinkedInSession } from "@/services/linkedin/session";

export async function GET() {
  if (!isLinkedInAutomationEnabled()) {
    return NextResponse.json({
      authenticated: false,
      userDataDir: "",
      error: "L'automatisation LinkedIn est désactivée.",
    });
  }

  const status = await checkLinkedInSession();
  return NextResponse.json(status);
}
