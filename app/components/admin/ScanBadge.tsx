import { Clock } from "lucide-react";
import React from "react";

interface ScanBadgeProps {
  label: string;
  time: string | null;
}

export function ScanBadge({ label, time }: ScanBadgeProps) {
  const isScanned = Boolean(time);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
        isScanned
          ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
          : "bg-slate-50 text-slate-400 border-slate-200/50 dark:bg-secondary/50 dark:text-muted-foreground/50 dark:border-border"
      }`}
    >
      <Clock
        size={12}
        className={
          isScanned
            ? "text-emerald-600 dark:text-emerald-400 shrink-0"
            : "text-slate-400 dark:text-muted-foreground/40 shrink-0"
        }
      />
      <span>
        {label}: {time || "—"}
      </span>
    </div>
  );
}
