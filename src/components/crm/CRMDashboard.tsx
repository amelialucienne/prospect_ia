"use client";

import { useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/types/lead";
import { Card, CardHeader } from "@/components/ui/Card";
import { LeadFilters, filterLeads, type LeadFiltersState } from "./LeadFilters";
import { LeadRow } from "./LeadRow";

interface CRMDashboardProps {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onViewOutreach: (lead: Lead) => void;
}

const DEFAULT_FILTERS: LeadFiltersState = {
  temperature: "all",
  minScore: 0,
  maxScore: 100,
};

export function CRMDashboard({
  leads,
  onStatusChange,
  onViewOutreach,
}: CRMDashboardProps) {
  const [filters, setFilters] = useState<LeadFiltersState>(DEFAULT_FILTERS);

  const filteredLeads = useMemo(
    () => filterLeads(leads, filters),
    [leads, filters]
  );

  const stats = useMemo(
    () => ({
      hot: leads.filter((l) => l.temperature === "hot").length,
      warm: leads.filter((l) => l.temperature === "warm").length,
      cold: leads.filter((l) => l.temperature === "cold").length,
      converted: leads.filter((l) => l.status === "converted").length,
    }),
    [leads]
  );

  if (leads.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
            <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">CRM vide</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Lancez le pipeline depuis le module Pipeline pour générer et enrichir vos leads.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Leads chauds", value: stats.hot, color: "text-rose-600 bg-rose-50 ring-rose-100" },
          { label: "Leads tièdes", value: stats.warm, color: "text-amber-600 bg-amber-50 ring-amber-100" },
          { label: "Leads froids", value: stats.cold, color: "text-sky-600 bg-sky-50 ring-sky-100" },
          { label: "Convertis", value: stats.converted, color: "text-emerald-600 bg-emerald-50 ring-emerald-100" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl px-4 py-3 ring-1 ${stat.color}`}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card padding="sm" className="overflow-hidden !p-0">
        <div className="border-b border-slate-100 px-6 py-5">
          <CardHeader
            title="Mini CRM"
            description="Gérez vos leads, filtres et statuts de prospection"
          />
          <LeadFilters
            filters={filters}
            onChange={setFilters}
            totalCount={leads.length}
            filteredCount={filteredLeads.length}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Contact</th>
                <th className="hidden px-4 py-3 sm:table-cell">Entreprise</th>
                <th className="hidden px-4 py-3 md:table-cell">Secteur</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Temp.</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onStatusChange={onStatusChange}
                  onViewOutreach={onViewOutreach}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-slate-500">
            Aucun lead ne correspond aux filtres sélectionnés.
          </p>
        )}
      </Card>
    </div>
  );
}
