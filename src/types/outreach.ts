export type OutreachMessageType = "initial" | "followUpDay2" | "followUpDay5";

export type OutreachDeliveryStatus =
  | "idle"
  | "pending"
  | "sending"
  | "sent"
  | "failed";

export interface OutreachDelivery {
  messageType: OutreachMessageType;
  status: OutreachDeliveryStatus;
  sentAt?: string;
  error?: string;
  jobId?: string;
}

export interface OutreachMessages {
  linkedInMessage: string;
  followUpDay2: string;
  followUpDay5: string;
}

export const OUTREACH_MESSAGE_LABELS: Record<OutreachMessageType, string> = {
  initial: "Message LinkedIn initial",
  followUpDay2: "Relance 1 (J+2)",
  followUpDay5: "Relance 2 (J+5)",
};

export function getMessageByType(
  outreach: OutreachMessages,
  type: OutreachMessageType
): string {
  switch (type) {
    case "initial":
      return outreach.linkedInMessage;
    case "followUpDay2":
      return outreach.followUpDay2;
    case "followUpDay5":
      return outreach.followUpDay5;
  }
}
