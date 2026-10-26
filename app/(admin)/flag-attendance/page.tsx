"use client";

import {
  getFlagAttendances,
  FlagAttendanceRow,
} from "@/services/flagAttendanceService";
import { FlagAttendanceTable } from "@/app/components/admin/FlagAttendanceTable";
import { exportFlagAttendanceToExcel } from "@/services/flagExportService";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { subDays, getDay, getYear, getMonth, getDate } from "date-fns";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_PILLS = [
  { id: "All Status", label: "All Status", dotColor: null },
  { id: "Present", label: "Present / On Time", dotColor: "bg-green-500" },
  { id: "Absent", label: "Late / Absent", dotColor: "bg-red-500" },
];

const currentYearNum = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => String(currentYearNum - i));

function getDatesForDayType(
  year: number,
  monthIndex: number,
  dayType: "Monday" | "Friday",
): number[] {
  const dates: number[] = [];
  const targetDay = dayType === "Monday" ? 1 : 5;
  const dateObj = new Date(year, monthIndex, 1);

  while (dateObj.getMonth() === monthIndex) {
    if (dateObj.getDay() === targetDay) {
      dates.push(dateObj.getDate());
    }
    dateObj.setDate(dateObj.getDate() + 1);
  }
  return dates;
}

function getSmartInitialState() {
  const now = new Date();
  let targetDate = new Date(now);
  const dayOfWeek = getDay(now);

  if (dayOfWeek >= 2 && dayOfWeek <= 4) {
    targetDate = subDays(now, dayOfWeek - 1);
  } else if (dayOfWeek === 6) {
    targetDate = subDays(now, 1);
  } else if (dayOfWeek === 0) {
    targetDate = subDays(now, 2);
  }

  const chosenYear = String(getYear(targetDate));
  const chosenMonth = MONTHS[getMonth(targetDate)];
  const chosenDayType: "Monday" | "Friday" =
    getDay(targetDate) === 5 ? "Friday" : "Monday";
  const chosenDayNum = getDate(targetDate);

  return { chosenYear, chosenMonth, chosenDayType, chosenDayNum };
}

export default function FlagAttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("All Status");

  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("October");
  const [selectedDayType, setSelectedDayType] = useState<"Monday" | "Friday">(
    "Friday",
  );
  const [selectedDayNum, setSelectedDayNum] = useState<number>(23);
  const [isClient, setIsClient] = useState(false);

  const [attendanceList, setAttendanceList] = useState<FlagAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const initialState = getSmartInitialState();
    setSelectedYear(initialState.chosenYear);
    setSelectedMonth(initialState.chosenMonth);
    setSelectedDayType(initialState.chosenDayType);
    setSelectedDayNum(initialState.chosenDayNum);
    setIsClient(true);
  }, []);

  const ceremonyType =
    selectedDayType === "Monday" ? "Flag Raising" : "Flag Lowering";

  const monthIndex = MONTHS.indexOf(selectedMonth);
  const availableDates = useMemo(() => {
    if (monthIndex === -1) return [];
    return getDatesForDayType(
      parseInt(selectedYear, 10),
      monthIndex,
      selectedDayType,
    );
  }, [selectedYear, monthIndex, selectedDayType]);

  useEffect(() => {
    if (
      isClient &&
      availableDates.length > 0 &&
      !availableDates.includes(selectedDayNum)
    ) {
      setSelectedDayNum(availableDates[0]);
    }
  }, [availableDates, isClient]);

  const formattedTargetDate = useMemo(() => {
    if (!isClient || monthIndex === -1) return "";
    const m = String(monthIndex + 1).padStart(2, "0");
    const d = String(selectedDayNum).padStart(2, "0");
    return `${selectedYear}-${m}-${d}`;
  }, [selectedYear, monthIndex, selectedDayNum, isClient]);

  useEffect(() => {
    if (!formattedTargetDate) return;
    const fetchFlagLogs = async () => {
      setLoading(true);
      try {
        const data = await getFlagAttendances(
          ceremonyType,
          formattedTargetDate,
        );
        setAttendanceList(data);
      } catch (err) {
        console.error("Error loading flag attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlagLogs();
    setCurrentPage(1);
  }, [ceremonyType, formattedTargetDate]);

  const filteredData = useMemo(() => {
    return attendanceList.filter((item) => {
      const name = item.user?.fullname?.toLowerCase() || "";
      const office = item.user?.office?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      const matchesSearch = name.includes(query) || office.includes(query);

      let matchesStatus = true;
      if (selectedStatusTab === "Present") {
        matchesStatus =
          item.status.toLowerCase() === "present" ||
          item.status.toLowerCase() === "on time";
      } else if (selectedStatusTab === "Absent") {
        matchesStatus =
          item.status.toLowerCase() === "absent" ||
          item.status.toLowerCase() === "late";
      }

      return matchesSearch && matchesStatus;
    });
  }, [attendanceList, searchQuery, selectedStatusTab]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleExport = () => {
    if (attendanceList.length === 0) return;

    exportFlagAttendanceToExcel(
      {
        ceremonyType,
        month: selectedMonth,
        dayNum: selectedDayNum,
        year: selectedYear,
        formattedDate: formattedTargetDate,
      },
      attendanceList,
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flag Attendance</h1>
          <p className="text-sm text-slate-400">
            Monitor ceremonial flag raising and lowering logs.
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

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 shrink-0">
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or office..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
          />
        </div>

        <div className="w-full xl:w-56">
          <select
            value={selectedDayType}
            onChange={(e) => setSelectedDayType(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-slate-700 transition cursor-pointer"
          >
            <option value="Monday" className="bg-slate-900 text-white">
              Monday (Raising)
            </option>
            <option value="Friday" className="bg-slate-900 text-white">
              Friday (Lowering)
            </option>
          </select>
        </div>

        <div className="w-full xl:w-44">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-slate-700 transition cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-white">
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full xl:w-32">
          <select
            value={selectedDayNum}
            onChange={(e) => setSelectedDayNum(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-slate-700 transition cursor-pointer"
          >
            {availableDates.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full xl:w-32">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-slate-700 transition cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y} className="bg-slate-900 text-white">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {STATUS_PILLS.map((pill) => {
          const isActive = selectedStatusTab === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setSelectedStatusTab(pill.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                isActive
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {pill.dotColor && (
                <span className={`w-2 h-2 rounded-full ${pill.dotColor}`} />
              )}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-sm">
            Loading flag attendance records...
          </div>
        ) : paginatedData.length > 0 ? (
          <>
            <FlagAttendanceTable data={paginatedData} />

            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/30 text-xs text-slate-400 mt-auto">
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
              No flag attendance records found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No matching records found for the selected date and filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
