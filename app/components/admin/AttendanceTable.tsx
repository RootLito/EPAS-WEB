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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-card text-muted-foreground text-xs font-semibold">
            <th className="py-3 px-5">Name</th>
            <th className="py-3 px-5">Office</th>
            <th className="py-3 px-5">
              Scan Times (In / Brk Out / Brk In / Out)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {data.map((row) => (
            <tr key={row.userId} className="hover:bg-secondary/40 transition">
              <td className="py-3.5 px-5 font-bold text-foreground">
                {row.name}
              </td>
              <td className="py-3.5 px-5 text-muted-foreground text-xs md:text-sm">
                {row.office}
              </td>
              <td className="py-3.5 px-5">
                <div className="flex flex-wrap items-center gap-1.5">
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
