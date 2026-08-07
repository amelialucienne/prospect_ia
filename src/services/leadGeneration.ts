import type { ICPProfile } from "@/types/icp";
import type { Lead } from "@/types/lead";
import { extractTerms, pickOne, randomBetween } from "@/lib/utils";
import { scoreLead } from "./scoring";
import { generateOutreachMessages } from "./messageGeneration";

const FIRST_NAMES = [
  "Sophie",
  "Thomas",
  "Camille",
  "Lucas",
  "Émilie",
  "Nicolas",
  "Julie",
  "Antoine",
  "Marine",
  "Pierre",
  "Laura",
  "Alexandre",
  "Claire",
  "Maxime",
  "Sarah",
];

const LAST_NAMES = [
  "Martin",
  "Bernard",
  "Dubois",
  "Thomas",
  "Robert",
  "Richard",
  "Petit",
  "Durand",
  "Leroy",
  "Moreau",
  "Simon",
  "Laurent",
  "Lefebvre",
  "Michel",
  "Garcia",
];

const COMPANY_PREFIXES = [
  "Nova",
  "Apex",
  "Bright",
  "Summit",
  "Pulse",
  "Vertex",
  "Clear",
  "Scale",
  "Flow",
  "Core",
  "Alt",
  "Prime",
];

const COMPANY_SUFFIXES = [
  "Labs",
  "Systems",
  "Analytics",
  "Solutions",
  "Dynamics",
  "Cloud",
  "Group",
  "Tech",
  "Digital",
  "Partners",
];

const PAIN_POINT_TEMPLATES = [
  "Difficulté à {pain} dans un contexte de croissance rapide",
  "Manque de visibilité sur {signal} pour prioriser les comptes stratégiques",
  "Processus commercial trop manuel pour atteindre les objectifs {size}",
  "Équipe commerciale saturée par des leads peu qualifiés",
  "Taux de conversion faible malgré un volume d'outbound élevé",
  "Outils actuels inadaptés aux spécificités du secteur {industry}",
  "Délais de réponse trop longs sur les opportunités chaudes",
  "Absence de scoring fiable pour segmenter le pipeline",
  "Messages de prospection trop génériques pour convaincre les {role}",
  "Alignement insuffisant entre marketing et ventes sur l'ICP",
];

function buildCompanyName(industry: string, index: number): string {
  const industryWord =
    industry.split(/\s+/)[0]?.charAt(0).toUpperCase() +
      industry.split(/\s+/)[0]?.slice(1) || "Tech";
  const prefix = COMPANY_PREFIXES[index % COMPANY_PREFIXES.length];
  const suffix = COMPANY_SUFFIXES[(index * 2) % COMPANY_SUFFIXES.length];
  return `${prefix}${industryWord} ${suffix}`;
}

function buildRole(icp: ICPProfile, index: number): string {
  const roles = icp.jobRoles
    .split(/[,;/\n]+/)
    .map((r) => r.trim())
    .filter(Boolean);

  if (roles.length > 0) {
    return roles[index % roles.length];
  }

  const defaults = [
    "Directeur Commercial",
    "VP Sales",
    "Head of Growth",
    "DRH",
    "Directeur Marketing",
    "CEO",
    "Responsable Revenue Ops",
  ];
  return defaults[index % defaults.length];
}

function buildPainPoint(icp: ICPProfile, index: number): string {
  const painTerms = extractTerms(icp.painPoints);
  const signalTerms = extractTerms(icp.buyingSignals);
  const pain = painTerms[0] || "scaler la prospection";
  const signal = signalTerms[0] || "les signaux d'achat";
  const roleTerms = extractTerms(icp.jobRoles);
  const role = roleTerms[0] || "décideurs";

  const template = PAIN_POINT_TEMPLATES[index % PAIN_POINT_TEMPLATES.length];
  return template
    .replace("{pain}", pain)
    .replace("{signal}", signal)
    .replace("{size}", icp.companySize)
    .replace("{industry}", icp.industry)
    .replace("{role}", role);
}

function buildLinkedInUrl(firstName: string, lastName: string): string {
  const slug = `${firstName}-${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  return `https://www.linkedin.com/in/${slug}`;
}

function generateRawLead(icp: ICPProfile, index: number): Omit<Lead, "buyingIntentScore" | "temperature" | "outreach"> {
  const firstName = pickOne(FIRST_NAMES);
  const lastName = pickOne(LAST_NAMES);

  return {
    id: `lead-${Date.now()}-${index}`,
    name: `${firstName} ${lastName}`,
    company: buildCompanyName(icp.industry, index),
    role: buildRole(icp, index),
    industry: icp.industry,
    painPoint: buildPainPoint(icp, index),
    status: "new",
    linkedInUrl: buildLinkedInUrl(firstName, lastName),
  };
}

export function generateLeads(icp: ICPProfile): Lead[] {
  const count = randomBetween(5, 10);
  const rawLeads = Array.from({ length: count }, (_, i) =>
    generateRawLead(icp, i)
  );

  return rawLeads.map((lead) => {
    const { score, temperature } = scoreLead(lead, icp);
    const outreach = generateOutreachMessages(lead, icp);

    return {
      ...lead,
      buyingIntentScore: score,
      temperature,
      outreach,
    };
  });
}
