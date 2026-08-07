export type ModuleId = "pipeline" | "crm" | "outreach";

interface SidebarProps {
  activeModule: ModuleId;
  onModuleChange: (module: ModuleId) => void;
  leadCount: number;
}

const NAV_ITEMS: { id: ModuleId; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "pipeline",
    label: "Pipeline",
    description: "ICP & génération",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    id: "crm",
    label: "Mini CRM",
    description: "Gestion des leads",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    id: "outreach",
    label: "Outreach",
    description: "Séquences messages",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
];

export function Sidebar({ activeModule, onModuleChange, leadCount }: SidebarProps) {
  return (
    <aside className="flex w-full flex-col border-b border-blue-100/80 bg-white/70 backdrop-blur-md lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-blue-50 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-md shadow-blue-200/50">
            CA
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">CREADIF AI</p>
            <p className="text-xs text-slate-500">Sales Automation</p>
          </div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onModuleChange(item.id)}
            className={`flex min-w-[140px] flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition-all lg:min-w-0 lg:flex-none ${
              activeModule === item.id
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={activeModule === item.id ? "text-blue-600" : "text-slate-400"}>
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="truncate text-xs text-slate-400">{item.description}</p>
            </div>
            {item.id === "crm" && leadCount > 0 && (
              <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                {leadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto hidden border-t border-blue-50 p-4 lg:block">
        <p className="text-xs font-medium text-slate-500">Moteurs actifs</p>
        <div className="mt-2 space-y-1.5">
          {["ICP Engine", "Prospect Engine", "Outreach Engine", "Scoring Engine"].map((engine) => (
            <div key={engine} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {engine}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
