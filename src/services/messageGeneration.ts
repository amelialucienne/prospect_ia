import type { ICPProfile } from "@/types/icp";
import type { Lead } from "@/types/lead";
import type { OutreachMessages } from "@/types/outreach";
import { extractTerms } from "@/lib/utils";

const LINKEDIN_INTROS = [
  "Bonjour {name}, votre parcours chez {company} m'a interpellé",
  "Bonjour {name}, je suivais {company} dans le secteur {industry}",
  "Bonjour {name}, en analysant les acteurs {industry}, {company} ressort naturellement",
  "Bonjour {name}, plusieurs {roleShort} m'ont parlé des défis chez {company}",
];

const LINKEDIN_BODIES = [
  "Beaucoup de {roleShort} rencontrent actuellement {painShort}. Nous accompagnons des équipes similaires sur {signalShort}.",
  "Votre profil correspond à des profils qui cherchent à résoudre {painShort}, notamment via {signalShort}.",
  "Nous aidons des entreprises {industry} à adresser {painShort} avec une approche centrée sur {signalShort}.",
];

const FOLLOWUP_DAY2 = [
  "Bonjour {name}, je me permets un rapide suivi sur mon message de lundi. Le sujet de {painShort} est-il une priorité chez {company} en ce moment ?",
  "Bonjour {name}, avez-vous eu l'occasion de réfléchir à {painShort} ? Je serais ravi d'échanger 15 minutes sur comment {signalShort}.",
];

const FOLLOWUP_DAY5 = [
  "Bonjour {name}, dernier message de ma part. Si {painShort} n'est pas d'actualité, pas de souci. Sinon, je peux partager un cas client {industry} pertinent pour {company}.",
  "Bonjour {name}, je clos ma séquence ici. Si le sujet {painShort} devient prioritaire, je reste disponible pour un échange court cette semaine.",
];

function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}...`;
}

function roleShort(role: string): string {
  return role.replace(/^(Directeur|Responsable|Head of|VP)\s+/i, "").toLowerCase();
}

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (text, [key, val]) => text.replaceAll(`{${key}}`, val),
    template
  );
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function generateOutreachMessages(
  lead: Pick<Lead, "name" | "company" | "role" | "industry" | "painPoint">,
  icp: ICPProfile
): OutreachMessages {
  const firstName = lead.name.split(" ")[0];
  const painTerms = extractTerms(icp.painPoints);
  const signalTerms = extractTerms(icp.buyingSignals);
  const seed = lead.name.length + lead.company.length;

  const vars = {
    name: firstName,
    company: lead.company,
    industry: lead.industry,
    roleShort: roleShort(lead.role),
    painShort: shorten(lead.painPoint.toLowerCase(), 70),
    signalShort: shorten(
      signalTerms[0] || painTerms[0] || "l'automatisation commerciale",
      50
    ),
  };

  const intro = fill(pick(LINKEDIN_INTROS, seed), vars);
  const body = fill(pick(LINKEDIN_BODIES, seed + 2), vars);

  return {
    linkedInMessage: `${intro}. ${body} Seriez-vous ouvert à un échange de 15 minutes cette semaine ?`,
    followUpDay2: fill(pick(FOLLOWUP_DAY2, seed + 1), vars),
    followUpDay5: fill(pick(FOLLOWUP_DAY5, seed + 3), vars),
  };
}
