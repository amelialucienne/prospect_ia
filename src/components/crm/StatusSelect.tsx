import type { LeadStatus } from "@/types/lead";
import { STATUS_LABELS } from "@/types/lead";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-slate-100 text-slate-700 ring-slate-200",
  contacted: "bg-blue-50 text-blue-700 ring-blue-200",
  replied: "bg-violet-50 text-violet-700 ring-violet-200",
  converted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

interface StatusSelectProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
}

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "replied", "converted"];

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className={cn(
        "rounded-lg px-2 py-1 text-xs font-medium ring-1 focus:outline-none focus:ring-2 focus:ring-blue-100",
        STATUS_STYLES[value]
      )}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
