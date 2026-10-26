import { FlagAttendanceRow } from "@/services/flagAttendanceService";

interface FlagAttendanceTableProps {
  data: FlagAttendanceRow[];
}

export function FlagAttendanceTable({ data }: FlagAttendanceTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Office</th>
            <th className="px-6 py-4">Ceremony Type</th>
            <th className="px-6 py-4">Scan Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm">
          {data.map((item) => {
            const isPresent =
              item.status.toLowerCase() === "present" ||
              item.status.toLowerCase() === "on time";

            return (
              <tr key={item.id} className="hover:bg-slate-900/40 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      isPresent
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPresent ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    />
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                  {item.user?.fullname || "Unknown User"}
                </td>
                <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                  {item.user?.office || "—"}
                </td>
                <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                  {item.ceremony_type}
                </td>
                <td className="px-6 py-4 text-slate-300 whitespace-nowrap font-mono text-xs">
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
