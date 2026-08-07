import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
        variant === "outline" && "border border-slate-200 bg-white text-slate-600",
        className
      )}
    >
      {children}
    </span>
  );
}
