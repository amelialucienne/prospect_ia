import type { LeadTemperature } from "@/types/lead";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getTemperatureFromScore(score: number): LeadTemperature {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export function formatScore(score: number): string {
  return `${Math.round(score)}`;
}

export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickMany<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function extractTerms(text: string): string[] {
  const stopWords = new Set([
    "les",
    "des",
    "une",
    "dans",
    "pour",
    "avec",
    "sans",
    "sur",
    "par",
    "est",
    "sont",
    "the",
    "and",
    "for",
    "with",
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüç-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));
}
