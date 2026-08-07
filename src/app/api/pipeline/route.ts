import { NextResponse } from "next/server";
import { runPipeline } from "@/services/pipeline";
import type { PipelineRequest } from "@/types/pipeline";

const MIN_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateICP(icp: PipelineRequest["icp"]): string | null {
  if (!icp.industry?.trim()) return "Le secteur d'activité est requis.";
  if (!icp.companySize?.trim()) return "La taille d'entreprise est requise.";
  if (!icp.jobRoles?.trim()) return "Les rôles cibles sont requis.";
  if (!icp.painPoints?.trim()) return "Les points de douleur sont requis.";
  if (!icp.buyingSignals?.trim()) return "Les signaux d'achat sont requis.";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PipelineRequest;
    const error = validateICP(body.icp);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await delay(MIN_DELAY_MS);

    const result = await runPipeline({
      industry: body.icp.industry.trim(),
      companySize: body.icp.companySize.trim(),
      jobRoles: body.icp.jobRoles.trim(),
      painPoints: body.icp.painPoints.trim(),
      buyingSignals: body.icp.buyingSignals.trim(),
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Échec du pipeline. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
