import type { OutreachDelivery, OutreachMessageType } from "@/types/outreach";

const MESSAGE_TYPES: OutreachMessageType[] = [
  "initial",
  "followUpDay2",
  "followUpDay5",
];

export function createInitialDeliveries(): OutreachDelivery[] {
  return MESSAGE_TYPES.map((messageType) => ({
    messageType,
    status: "idle" as const,
  }));
}

export function getDeliveryForType(
  deliveries: OutreachDelivery[] | undefined,
  messageType: OutreachMessageType
): OutreachDelivery | undefined {
  return deliveries?.find((d) => d.messageType === messageType);
}

export async function pollSendJob(
  jobId: string,
  onUpdate?: (status: string) => void,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<{ status: string; error?: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`/api/linkedin/send/${jobId}`);
    if (!res.ok) {
      throw new Error("Job introuvable.");
    }

    const job = (await res.json()) as {
      status: string;
      error?: string;
    };

    onUpdate?.(job.status);

    if (job.status === "completed") {
      return { status: "completed" };
    }

    if (job.status === "failed") {
      return { status: "failed", error: job.error };
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { status: "failed", error: "Délai d'attente dépassé." };
}
