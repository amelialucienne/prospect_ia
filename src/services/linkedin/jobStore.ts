import type { LinkedInSendJob } from "@/types/linkedin";
import type { OutreachMessageType } from "@/types/outreach";

const jobs = new Map<string, LinkedInSendJob>();

function generateJobId(): string {
  return `li-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSendJob(params: {
  leadId: string;
  messageType: OutreachMessageType;
  linkedInUrl: string;
}): LinkedInSendJob {
  const job: LinkedInSendJob = {
    id: generateJobId(),
    leadId: params.leadId,
    messageType: params.messageType,
    linkedInUrl: params.linkedInUrl,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  jobs.set(job.id, job);
  return job;
}

export function getSendJob(jobId: string): LinkedInSendJob | undefined {
  return jobs.get(jobId);
}

export function updateSendJob(
  jobId: string,
  update: Partial<Pick<LinkedInSendJob, "status" | "completedAt" | "error">>
): LinkedInSendJob | undefined {
  const job = jobs.get(jobId);
  if (!job) return undefined;

  const updated = { ...job, ...update };
  jobs.set(jobId, updated);
  return updated;
}

export async function processSendJob(
  jobId: string,
  message: string
): Promise<LinkedInSendJob> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error("Job introuvable.");
  }

  updateSendJob(jobId, { status: "running" });

  const { sendLinkedInMessage } = await import("./sendMessage");
  const result = await sendLinkedInMessage(job.linkedInUrl, message);

  if (result.success) {
    return updateSendJob(jobId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    })!;
  }

  return updateSendJob(jobId, {
    status: "failed",
    completedAt: new Date().toISOString(),
    error: result.error,
  })!;
}
