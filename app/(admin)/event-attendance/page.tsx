"use client";

import { AttendanceTable } from "@/app/components/admin/AttendanceTable";
import { getEventAttendances } from "@/services/attendanceService";
import { getEvents } from "@/services/eventService";
import { exportAttendanceToExcel } from "@/services/exportService";
import { AttendanceRow } from "@/types/attendance";
import { createClient } from "@/utils/supabase/client";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function EventAttendancePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "present" | "absent"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const initData = async () => {
      try {
        const eventsData = await getEvents();
        if (eventsData && eventsData.length > 0) {
          setEvents(eventsData);
          setSelectedEventId(eventsData[0].id);
        }
      } catch (err) {
        console.error("Error initializing attendance page:", err);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    const fetchLogsAndUsers = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        const [usersRes, attendancesData] = await Promise.all([
          supabase
            .from("users")
            .select("id, fullname, office, role")
            .neq("role", "admin"),
          getEventAttendances(selectedEventId),
        ]);

        const allUsers = usersRes.data || [];
        const logs = attendancesData || [];

        const userLogMap: Record<string, any> = {};
        logs.forEach((item) => {
          const uid = item.user_id;
          if (!userLogMap[uid]) {
            userLogMap[uid] = {
              time_in: null,
              break_out: null,
              break_in: null,
              time_out: null,
              firstScanTime: null,
            };
          }
          if (item.scan_type && item.scanned_at) {
            userLogMap[uid][item.scan_type] = item.scanned_at;
            if (
              !userLogMap[uid].firstScanTime ||
              new Date(item.scanned_at) <
                new Date(userLogMap[uid].firstScanTime)
            ) {
              userLogMap[uid].firstScanTime = item.scanned_at;
            }
          }
        });

        const combinedRows: AttendanceRow[] = allUsers.map((u) => {
          const scanData = userLogMap[u.id] || {
            time_in: null,
            break_out: null,
            break_in: null,
            time_out: null,
            firstScanTime: null,
          };

          return {
            userId: u.id,
            name: u.fullname || "Unknown User",
            office: u.office || "—",
            time_in: scanData.time_in,
            break_out: scanData.break_out,
            break_in: scanData.break_in,
            time_out: scanData.time_out,
            firstScanTime: scanData.firstScanTime,
          };
        });

        combinedRows.sort((a, b) => {
          if (a.firstScanTime && b.firstScanTime) {
            return (
              new Date(a.firstScanTime).getTime() -
              new Date(b.firstScanTime).getTime()
            );
          }
          if (a.firstScanTime) return -1;
          if (b.firstScanTime) return 1;
          return a.name.localeCompare(b.name);
        });

        setAttendanceRows(combinedRows);
      } catch (err) {
        console.error("Error loading attendance matrix:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogsAndUsers();
    setCurrentPage(1);
  }, [selectedEventId]);

  const filteredData = attendanceRows.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.office.toLowerCase().includes(searchQuery.toLowerCase());

    const isPresent = row.firstScanTime !== null;
    if (statusFilter === "present" && !isPresent) return false;
    if (statusFilter === "absent" && isPresent) return false;

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleExport = () => {
    const currentEvent = events.find((ev) => ev.id === selectedEventId);
    if (!currentEvent) return;

    exportAttendanceToExcel(currentEvent, attendanceRows);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Event Attendance
          </h1>
          <p className="text-sm text-slate-400">
            Track participant check-ins and logs for scheduled events.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm transition shadow-sm cursor-pointer"
        >
          <Download size={16} className="text-slate-400" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or office..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
          />
        </div>

        {/* Event Selector Dropdown */}
        <div className="w-full sm:w-80">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-slate-700 transition cursor-pointer truncate"
          >
            {events.map((ev) => (
              <option
                key={ev.id}
                value={ev.id}
                className="bg-slate-900 text-white"
              >
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-slate-700 transition cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">
              All Participants
            </option>
            <option value="present" className="bg-slate-900 text-white">
              Present
            </option>
            <option value="absent" className="bg-slate-900 text-white">
              Did Not Attend
            </option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-sm">
            Loading attendance records...
          </div>
        ) : filteredData.length > 0 ? (
          <>
            <AttendanceTable data={paginatedData} />

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/30 text-xs text-slate-400">
              <span>
                Showing page{" "}
                <strong className="text-white">{currentPage}</strong> of{" "}
                <strong className="text-white">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <CalendarCheck size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-300">
              No attendance logs found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No matching employee records found for your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
