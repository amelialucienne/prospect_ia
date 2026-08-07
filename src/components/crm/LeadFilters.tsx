"use client";

import type { Lead, LeadTemperature } from "@/types/lead";

export interface LeadFiltersState {
  temperature: LeadTemperature | "all";
  minScore: number;
  maxScore: number;
}

interface LeadFiltersProps {
  filters: LeadFiltersState;
  onChange: (filters: LeadFiltersState) => void;
  totalCount: number;
  filteredCount: number;
}

const TEMPERATURE_OPTIONS: { value: LeadFiltersState["temperature"]; label: string }[] = [
  { value: "all", label: "Toutes températures" },
  { value: "hot", label: "Chaud" },
  { value: "warm", label: "Tiède" },
  { value: "cold", label: "Froid" },
];

export function LeadFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: LeadFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">Température</label>
          <select
            value={filters.temperature}
            onChange={(e) =>
              onChange({
                ...filters,
                temperature: e.target.value as LeadFiltersState["temperature"],
              })
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {TEMPERATURE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">
            Score min : {filters.minScore}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.minScore}
            onChange={(e) =>
              onChange({
                ...filters,
                minScore: Math.min(Number(e.target.value), filters.maxScore),
              })
            }
            className="w-36 accent-blue-600"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">
            Score max : {filters.maxScore}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.maxScore}
            onChange={(e) =>
              onChange({
                ...filters,
                maxScore: Math.max(Number(e.target.value), filters.minScore),
              })
            }
            className="w-36 accent-blue-600"
          />
        </div>
      </div>

      <p className="text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{filteredCount}</span> / {totalCount} leads
      </p>
    </div>
  );
}

export function filterLeads(leads: Lead[], filters: LeadFiltersState): Lead[] {
  return leads.filter((lead) => {
    if (filters.temperature !== "all" && lead.temperature !== filters.temperature) {
      return false;
    }
    if (lead.buyingIntentScore < filters.minScore) return false;
    if (lead.buyingIntentScore > filters.maxScore) return false;
    return true;
  });
}
