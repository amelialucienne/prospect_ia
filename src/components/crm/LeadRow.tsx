"use client";

import type { Lead, LeadStatus } from "@/types/lead";
import { ScoreBar, TemperatureBadge } from "./LeadBadges";
import { StatusSelect } from "./StatusSelect";
import { Button } from "@/components/ui/Button";

interface LeadRowProps {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onViewOutreach: (lead: Lead) => void;
}

export function LeadRow({ lead, onStatusChange, onViewOutreach }: LeadRowProps) {
  return (
    <tr className="border-b border-slate-50 transition-colors hover:bg-blue-50/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-sky-50 text-xs font-semibold text-blue-600">
            {lead.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{lead.name}</p>
            <p className="text-xs text-slate-500">{lead.role}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">
        {lead.company}
      </td>
      <td className="hidden px-4 py-3 text-sm text-slate-500 md:table-cell">
        {lead.industry}
      </td>
      <td className="px-4 py-3">
        <ScoreBar score={lead.buyingIntentScore} />
      </td>
      <td className="px-4 py-3">
        <TemperatureBadge temperature={lead.temperature} />
      </td>
      <td className="px-4 py-3">
        <StatusSelect
          value={lead.status}
          onChange={(status) => onStatusChange(lead.id, status)}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewOutreach(lead)}
        >
          Outreach
        </Button>
      </td>
    </tr>
  );
}
