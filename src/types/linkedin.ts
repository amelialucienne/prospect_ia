import type { OutreachMessageType } from "./outreach";

export interface LinkedInSessionStatus {
  authenticated: boolean;
  profileName?: string;
  userDataDir: string;
  error?: string;
}

export interface LinkedInSendRequest {
  leadId: string;
  linkedInUrl: string;
  message: string;
  messageType: OutreachMessageType;
}

export type LinkedInJobStatus = "pending" | "running" | "completed" | "failed";

export interface LinkedInSendJob {
  id: string;
  leadId: string;
  messageType: OutreachMessageType;
  linkedInUrl: string;
  status: LinkedInJobStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
}
