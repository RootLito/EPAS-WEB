"use client";

import { AttendanceTable } from "@/app/components/admin/AttendanceTable";
import { getEventAttendances } from "@/services/attendanceService";
import { getEvents } from "@/services/eventService";
import { exportAttendanceToExcel } from "@/services/exportService";
import { AttendanceRow } from "@/types/attendance";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
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
    <div className="space-y-6">
      {/* 1. Header (1:1 with EventIndex Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Event Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Track participant check-ins and logs for scheduled events
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold transition shadow-none self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* 2. Toolbar (Search & Dropdowns using EventIndex's exact search style) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="flex items-center w-full xl:max-w-sm bg-card border border-border px-4 py-2.5 rounded-md text-foreground shadow-none">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or office..."
            className="flex-1 ml-3 bg-transparent text-sm text-foreground font-medium outline-none placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Event Selector Dropdown */}
        <div className="w-full sm:w-80">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-card border border-border px-4 py-2.5 rounded-md text-foreground text-sm font-medium outline-none cursor-pointer truncate shadow-none"
          >
            {events.map((ev) => (
              <option
                key={ev.id}
                value={ev.id}
                className="bg-card text-foreground"
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
            className="w-full bg-card border border-border px-4 py-2.5 rounded-md text-foreground text-sm font-medium outline-none cursor-pointer shadow-none"
          >
            <option value="all" className="bg-card text-foreground">
              All Participants
            </option>
            <option value="present" className="bg-card text-foreground">
              Present
            </option>
            <option value="absent" className="bg-card text-foreground">
              Did Not Attend
            </option>
          </select>
        </div>
      </div>

      {/* 3. Table Card Container */}
      {loading ? (
        <div className="p-12 bg-card border border-border rounded-md flex items-center justify-center shadow-none">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredData.length > 0 ? (
        <div className="bg-card border border-border rounded-md overflow-hidden shadow-none flex flex-col">
          <AttendanceTable data={paginatedData} />

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card text-xs text-muted-foreground">
            <span>
              Showing page{" "}
              <strong className="text-foreground">{currentPage}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 bg-card border border-border border-dashed rounded-md flex items-center justify-center text-center shadow-none">
          <p className="text-sm font-medium text-muted-foreground">
            No attendance records found.
          </p>
        </div>
      )}
    </div>
  );
}
