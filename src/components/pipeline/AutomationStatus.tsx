import { AUTOMATION_MODULES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";

interface AutomationStatusProps {
  activeStep: number;
  isRunning: boolean;
}

export function AutomationStatus({ activeStep, isRunning }: AutomationStatusProps) {
  return (
    <Card padding="sm" className="border-blue-100/60">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Couche d&apos;automatisation
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {AUTOMATION_MODULES.map((module, index) => {
          const isActive = isRunning && index <= activeStep;
          const isCurrent = isRunning && index === activeStep;

          return (
            <div
              key={module.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                isCurrent
                  ? "border-blue-200 bg-blue-50/80"
                  : isActive
                    ? "border-emerald-100 bg-emerald-50/50"
                    : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isCurrent
                    ? "bg-blue-600 text-white"
                    : isActive
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {isActive && !isCurrent ? "✓" : index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-700">
                  {module.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isCurrent ? "En cours..." : isActive ? "Terminé" : "En attente"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
