"use client";

import { useCallback, useState } from "react";
import type { ICPProfile } from "@/types/icp";
import type { Lead, LeadStatus } from "@/types/lead";
import type { OutreachDelivery, OutreachMessageType } from "@/types/outreach";
import { createInitialDeliveries } from "@/lib/linkedin/outreachHelpers";
import type { PipelineResponse, PipelineStepId } from "@/types/pipeline";
import { PIPELINE_STEPS } from "@/types/pipeline";
import { Sidebar, type ModuleId } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ICPForm } from "@/components/icp/ICPForm";
import { PipelineAnimation } from "@/components/pipeline/PipelineAnimation";
import { AutomationStatus } from "@/components/pipeline/AutomationStatus";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { OutreachPanel } from "@/components/outreach/OutreachPanel";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STEP_DURATION_MS = 900;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PlatformDashboard() {
  const [activeModule, setActiveModule] = useState<ModuleId>("pipeline");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [icpProfile, setIcpProfile] = useState<ICPProfile | null>(null);
  const [metadata, setMetadata] = useState<PipelineResponse["metadata"] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStepId | null>(null);
  const [completedSteps, setCompletedSteps] = useState<PipelineStepId[]>([]);
  const [automationStep, setAutomationStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const hotLeads = leads.filter((l) => l.temperature === "hot").length;

  const runStepAnimation = useCallback(async () => {
    setCompletedSteps([]);
    setCurrentStep(null);
    setAutomationStep(0);

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      const step = PIPELINE_STEPS[i];
      setCurrentStep(step.id);
      setAutomationStep(i);
      await wait(STEP_DURATION_MS);
      setCompletedSteps((prev) => [...prev, step.id]);
    }

    setCurrentStep(null);
    setAutomationStep(PIPELINE_STEPS.length);
  }, []);

  async function handlePipelineSubmit(icp: ICPProfile) {
    setIsRunning(true);
    setError(null);
    setIcpProfile(icp);

    const animationPromise = runStepAnimation();

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Une erreur s'est produite.");
      }

      await animationPromise;

      const data = result as PipelineResponse;
      setLeads(
        data.leads.map((lead) => ({
          ...lead,
          outreachDeliveries: createInitialDeliveries(),
        }))
      );
      setMetadata(data.metadata);
      setSelectedLeadId(data.leads[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du pipeline.");
      setCompletedSteps([]);
      setCurrentStep(null);
    } finally {
      setIsRunning(false);
    }
  }

  function handleStatusChange(id: string, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );
  }

  function handleViewOutreach(lead: Lead) {
    setSelectedLeadId(lead.id);
    setActiveModule("outreach");
  }

  function handleDeliveryUpdate(
    leadId: string,
    messageType: OutreachMessageType,
    update: Partial<OutreachDelivery>
  ) {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;

        const deliveries = lead.outreachDeliveries ?? createInitialDeliveries();
        const updated = deliveries.map((d) =>
          d.messageType === messageType ? { ...d, ...update } : d
        );

        return { ...lead, outreachDeliveries: updated };
      })
    );
  }

  function handleLeadContacted(leadId: string) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId && lead.status === "new"
          ? { ...lead, status: "contacted" as LeadStatus }
          : lead
      )
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-200/25 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <Sidebar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          leadCount={leads.length}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <TopBar
            pipelineRunning={isRunning}
            leadCount={leads.length}
            hotLeads={hotLeads}
          />

          <main className="flex-1 px-4 py-6 sm:px-6">
            {activeModule === "pipeline" && (
              <div className="mx-auto max-w-4xl space-y-6">
                <ICPForm onSubmit={handlePipelineSubmit} isLoading={isRunning} initialValues={icpProfile ?? undefined} />

                {error && (
                  <div
                    role="alert"
                    className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </div>
                )}

                {(isRunning || completedSteps.length > 0) && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <PipelineAnimation
                      currentStep={currentStep}
                      completedSteps={completedSteps}
                    />
                    <AutomationStatus
                      activeStep={automationStep}
                      isRunning={isRunning}
                    />
                  </div>
                )}

                {metadata && !isRunning && (
                  <Card padding="sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                        Pipeline terminé
                      </Badge>
                      <span className="text-sm text-slate-600">
                        {metadata.leadCount} leads générés · Score moyen{" "}
                        <strong>{metadata.averageScore}</strong> ·{" "}
                        <strong>{metadata.hotLeads}</strong> leads chauds
                      </span>
                    </div>
                  </Card>
                )}

                {leads.length > 0 && !isRunning && (
                  <Card>
                    <h3 className="mb-4 text-sm font-semibold text-slate-700">
                      Aperçu Prospect Engine — Top leads
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {leads.slice(0, 4).map((lead) => (
                        <div
                          key={lead.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                        >
                          <p className="font-medium text-slate-800">{lead.name}</p>
                          <p className="text-xs text-slate-500">
                            {lead.role} · {lead.company}
                          </p>
                          <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                            {lead.painPoint}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="font-semibold text-blue-600">
                              Score {lead.buyingIntentScore}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="capitalize text-slate-500">
                              {lead.temperature === "hot"
                                ? "Chaud"
                                : lead.temperature === "warm"
                                  ? "Tiède"
                                  : "Froid"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeModule === "crm" && (
              <div className="mx-auto max-w-6xl">
                <CRMDashboard
                  leads={leads}
                  onStatusChange={handleStatusChange}
                  onViewOutreach={handleViewOutreach}
                />
              </div>
            )}

            {activeModule === "outreach" && (
              <div className="mx-auto max-w-6xl">
                <OutreachPanel
                  leads={leads}
                  selectedLeadId={selectedLeadId}
                  onSelectLead={setSelectedLeadId}
                  onDeliveryUpdate={handleDeliveryUpdate}
                  onLeadContacted={handleLeadContacted}
                />
              </div>
            )}
          </main>

          <footer className="border-t border-blue-50 px-6 py-4 text-center text-xs text-slate-400">
            CREADIF AI &mdash; Plateforme de prospection B2B automatisée (simulation)
          </footer>
        </div>
      </div>
    </div>
  );
}
