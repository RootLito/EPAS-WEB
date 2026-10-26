import { ScanBadge } from "@/app/components/admin/ScanBadge";
import { AttendanceRow } from "@/types/attendance";
import React from "react";

interface AttendanceTableProps {
  data: AttendanceRow[];
}

export function AttendanceTable({ data }: AttendanceTableProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <th className="py-3.5 px-6">Name</th>
            <th className="py-3.5 px-6">Office</th>
            <th className="py-3.5 px-6">
              Scan Times (In / Brk Out / Brk In / Out)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-sm font-medium text-slate-300">
          {data.map((row) => (
            <tr key={row.userId} className="hover:bg-slate-900/30 transition">
              <td className="py-4 px-6 font-bold text-white">{row.name}</td>
              <td className="py-4 px-6 text-slate-400">{row.office}</td>
              <td className="py-4 px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <ScanBadge label="In" time={formatTime(row.time_in)} />
                  <ScanBadge label="Brk Out" time={formatTime(row.break_out)} />
                  <ScanBadge label="Brk In" time={formatTime(row.break_in)} />
                  <ScanBadge label="Out" time={formatTime(row.time_out)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
