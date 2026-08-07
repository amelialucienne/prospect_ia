import type { OutreachDelivery, OutreachMessages } from "./outreach";

export type LeadTemperature = "cold" | "warm" | "hot";
export type LeadStatus = "new" | "contacted" | "replied" | "converted";

export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  industry: string;
  painPoint: string;
  buyingIntentScore: number;
  temperature: LeadTemperature;
  status: LeadStatus;
  linkedInUrl: string;
  outreach: OutreachMessages;
  outreachDeliveries?: OutreachDelivery[];
}

export const TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  cold: "Froid",
  warm: "Tiède",
  hot: "Chaud",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  replied: "Répondu",
  converted: "Converti",
};
