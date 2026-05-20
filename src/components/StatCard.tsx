import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  tone?: "default" | "active" | "soon" | "expired";
  className?: string;
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800",
  active: "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30",
  soon: "bg-amber-50/70 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30",
  expired: "bg-red-50/70 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-900/30",
};

export function StatCard({ title, value, hint, icon, tone = "default", className }: Props) {
  return (
    <div className={cn(
      "card-elevated p-5 flex items-center gap-4.5 animate-fade-in",
      "border border-slate-100/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
      className
    )}>
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300", TONE[tone])}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 leading-none mb-1">{title}</p>
        <p className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground leading-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground/70 mt-1 truncate font-medium">{hint}</p>}
      </div>
    </div>
  );
}
