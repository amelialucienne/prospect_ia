import type { ICPProfile } from "@/types/icp";
import type { PipelineResponse } from "@/types/pipeline";
import { averageScore } from "@/lib/utils";
import { generateLeads } from "./leadGeneration";
import { sortLeadsByScore } from "./scoring";

export async function runPipeline(icp: ICPProfile): Promise<PipelineResponse> {
  const leads = sortLeadsByScore(generateLeads(icp));
  const scores = leads.map((l) => l.buyingIntentScore);

  return {
    leads,
    metadata: {
      processedAt: new Date().toISOString(),
      leadCount: leads.length,
      averageScore: averageScore(scores),
      hotLeads: leads.filter((l) => l.temperature === "hot").length,
    },
  };
}
