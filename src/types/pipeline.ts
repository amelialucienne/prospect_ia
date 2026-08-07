import type { ICPProfile } from "@/types/icp";
import type { Lead } from "@/types/lead";

export type PipelineStepId =
  | "analyzing-icp"
  | "finding-prospects"
  | "scoring-leads"
  | "generating-messages";

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  description: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "analyzing-icp",
    label: "Analyse de l'ICP",
    description: "Extraction des critères et signaux d'achat",
  },
  {
    id: "finding-prospects",
    label: "Recherche de prospects",
    description: "Génération de leads qualifiés depuis la base simulée",
  },
  {
    id: "scoring-leads",
    label: "Scoring des leads",
    description: "Calcul du score d'intention et de la température",
  },
  {
    id: "generating-messages",
    label: "Génération des messages",
    description: "Personnalisation des séquences d'outreach",
  },
];

export interface PipelineRequest {
  icp: ICPProfile;
}

export interface PipelineResponse {
  leads: Lead[];
  metadata: {
    processedAt: string;
    leadCount: number;
    averageScore: number;
    hotLeads: number;
  };
}

export type PipelineStatus = "idle" | "running" | "complete" | "error";
