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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
        isScanned
          ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
          : "bg-slate-900/50 border-slate-800/80 text-slate-600 opacity-60"
      }`}
    >
      <Clock
        size={12}
        className={isScanned ? "text-emerald-400" : "text-slate-600"}
      />
      <span>
        {label}: {time || "—"}
      </span>
    </div>
  );
}
