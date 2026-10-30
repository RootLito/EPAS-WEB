import { FlagAttendanceRow } from "@/services/flagAttendanceService";
import React from "react";

interface FlagAttendanceTableProps {
  data: FlagAttendanceRow[];
}

export function FlagAttendanceTable({ data }: FlagAttendanceTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-card text-xs font-semibold text-muted-foreground">
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Office</th>
            <th className="px-5 py-3">Ceremony Type</th>
            <th className="px-5 py-3">Scan Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {data.map((item) => {
            const isPresent =
              item.status.toLowerCase() === "present" ||
              item.status.toLowerCase() === "on time";

            return (
              <tr key={item.id} className="hover:bg-secondary/40 transition">
                {/* Soft Status Pill Badge */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                      isPresent
                        ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-rose-50/80 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPresent
                          ? "bg-emerald-500 dark:bg-emerald-400"
                          : "bg-rose-500 dark:bg-rose-400"
                      }`}
                    />
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-bold text-foreground whitespace-nowrap">
                  {item.user?.fullname || "Unknown User"}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap text-xs md:text-sm">
                  {item.user?.office || "—"}
                </td>
                <td className="px-5 py-3.5 text-foreground/80 whitespace-nowrap text-xs md:text-sm">
                  {item.ceremony_type}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap font-mono text-xs">
                  {item.scan_time || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
