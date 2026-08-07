import type { LeadTemperature } from "@/types/lead";

export const TEMPERATURE_STYLES: Record<
  LeadTemperature,
  { bg: string; text: string; ring: string; dot: string }
> = {
  cold: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-200",
    dot: "bg-sky-400",
  },
  warm: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-400",
  },
  hot: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
  },
};

export const AUTOMATION_MODULES = [
  {
    id: "lead-generation",
    name: "Lead Generation Pipeline",
    status: "active" as const,
  },
  {
    id: "enrichment",
    name: "Enrichment Step",
    status: "active" as const,
  },
  {
    id: "scoring",
    name: "Scoring Engine",
    status: "active" as const,
  },
  {
    id: "messaging",
    name: "Message Generation Engine",
    status: "active" as const,
  },
  {
    id: "linkedin-automation",
    name: "LinkedIn Automation",
    status: "active" as const,
  },
];
