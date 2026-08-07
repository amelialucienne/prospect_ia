import { PIPELINE_STEPS, type PipelineStepId } from "@/types/pipeline";
import { Card, CardHeader } from "@/components/ui/Card";

interface PipelineAnimationProps {
  currentStep: PipelineStepId | null;
  completedSteps: PipelineStepId[];
}

export function PipelineAnimation({
  currentStep,
  completedSteps,
}: PipelineAnimationProps) {
  return (
    <Card>
      <CardHeader
        title="Pipeline de génération"
        description="Exécution séquentielle des moteurs IA"
      />
      <div className="space-y-3">
        {PIPELINE_STEPS.map((step, index) => {
          const isComplete = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isPending = !isComplete && !isCurrent;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-all duration-500 ${
                isCurrent
                  ? "border-blue-200 bg-blue-50/60 shadow-sm"
                  : isComplete
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-slate-100 bg-slate-50/30 opacity-60"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isCurrent
                    ? "bg-blue-600 text-white"
                    : isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {isCurrent ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : isComplete ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
              {isCurrent && (
                <span className="hidden text-xs font-medium text-blue-600 sm:block">
                  En cours...
                </span>
              )}
              {isComplete && (
                <span className="hidden text-xs font-medium text-emerald-600 sm:block">
                  Terminé
                </span>
              )}
              {isPending && (
                <span className="hidden text-xs text-slate-400 sm:block">
                  En attente
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
