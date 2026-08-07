import { Badge } from "@/components/ui/Badge";

interface TopBarProps {
  pipelineRunning: boolean;
  leadCount: number;
  hotLeads: number;
}

export function TopBar({ pipelineRunning, leadCount, hotLeads }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-blue-100/80 bg-white/70 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">
            Plateforme de prospection B2B
          </h1>
          <p className="text-sm text-slate-500">
            Automatisation intelligente de la génération et de l&apos;outreach
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pipelineRunning && (
            <Badge className="animate-pulse bg-amber-50 text-amber-700 ring-amber-200">
              Pipeline en cours...
            </Badge>
          )}
          <Badge>{leadCount} leads</Badge>
          <Badge className="bg-rose-50 text-rose-700 ring-rose-200">
            {hotLeads} chauds
          </Badge>
        </div>
      </div>
    </header>
  );
}
