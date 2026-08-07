import type { ICPProfile } from "@/types/icp";
import type { Lead, LeadTemperature } from "@/types/lead";
import { extractTerms, getTemperatureFromScore, randomBetween } from "@/lib/utils";

interface ScoreResult {
  score: number;
  temperature: LeadTemperature;
}

function computeIcpAlignment(lead: Omit<Lead, "buyingIntentScore" | "temperature" | "outreach">, icp: ICPProfile): number {
  let alignment = 50;

  const industryTerms = extractTerms(icp.industry);
  const roleTerms = extractTerms(icp.jobRoles);
  const painTerms = extractTerms(icp.painPoints);
  const signalTerms = extractTerms(icp.buyingSignals);

  const leadText = `${lead.role} ${lead.painPoint} ${lead.industry}`.toLowerCase();

  for (const term of [...industryTerms, ...roleTerms, ...painTerms, ...signalTerms]) {
    if (leadText.includes(term)) {
      alignment += 4;
    }
  }

  if (lead.industry.toLowerCase() === icp.industry.toLowerCase()) {
    alignment += 10;
  }

  const sizeBoost: Record<string, number> = {
    "1-10": 5,
    "11-50": 8,
    "51-200": 12,
    "201-500": 10,
    "500+": 7,
  };
  alignment += sizeBoost[icp.companySize] ?? 5;

  return Math.min(alignment, 85);
}

export function scoreLead(
  lead: Omit<Lead, "buyingIntentScore" | "temperature" | "outreach">,
  icp: ICPProfile
): ScoreResult {
  const alignment = computeIcpAlignment(lead, icp);
  const variance = randomBetween(-12, 15);
  const score = Math.max(12, Math.min(98, alignment + variance));
  const temperature = getTemperatureFromScore(score);

  return { score, temperature };
}

export function sortLeadsByScore(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => b.buyingIntentScore - a.buyingIntentScore);
}
