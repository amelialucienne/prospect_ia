import { NextResponse } from "next/server";
import { getSendJob } from "@/services/linkedin/jobStore";

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { jobId } = await params;
  const job = getSendJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job introuvable." }, { status: 404 });
  }

  return NextResponse.json(job);
}
