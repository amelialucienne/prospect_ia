import { NextResponse } from "next/server";
import { isLinkedInAutomationEnabled } from "@/lib/linkedin/config";
import {
  createSendJob,
  processSendJob,
} from "@/services/linkedin/jobStore";
import { checkLinkedInSession } from "@/services/linkedin/session";
import type { LinkedInSendRequest } from "@/types/linkedin";
import type { OutreachMessageType } from "@/types/outreach";

const VALID_MESSAGE_TYPES: OutreachMessageType[] = [
  "initial",
  "followUpDay2",
  "followUpDay5",
];

function isValidLinkedInUrl(url: string): boolean {
  return /linkedin\.com\/in\//i.test(url);
}

export async function POST(request: Request) {
  if (!isLinkedInAutomationEnabled()) {
    return NextResponse.json(
      { error: "L'automatisation LinkedIn est désactivée." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as LinkedInSendRequest;

    if (!body.leadId?.trim()) {
      return NextResponse.json({ error: "leadId requis." }, { status: 400 });
    }

    if (!body.linkedInUrl?.trim() || !isValidLinkedInUrl(body.linkedInUrl)) {
      return NextResponse.json(
        { error: "URL de profil LinkedIn invalide." },
        { status: 400 }
      );
    }

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message requis." }, { status: 400 });
    }

    if (!VALID_MESSAGE_TYPES.includes(body.messageType)) {
      return NextResponse.json(
        { error: "Type de message invalide." },
        { status: 400 }
      );
    }

    const session = await checkLinkedInSession();
    if (!session.authenticated) {
      return NextResponse.json(
        {
          error:
            session.error ??
            "Session LinkedIn non authentifiée. Lancez « npm run linkedin:auth ».",
        },
        { status: 401 }
      );
    }

    const job = createSendJob({
      leadId: body.leadId,
      messageType: body.messageType,
      linkedInUrl: body.linkedInUrl.trim(),
    });

    void processSendJob(job.id, body.message.trim()).catch((err) => {
      console.error("[linkedin/send] Job failed:", err);
    });

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch {
    return NextResponse.json(
      { error: "Échec de la création du job d'envoi." },
      { status: 500 }
    );
  }
}
