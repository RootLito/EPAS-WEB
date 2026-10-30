"use client";

import {
  getFlagAttendances,
  FlagAttendanceRow,
} from "@/services/flagAttendanceService";
import { FlagAttendanceTable } from "@/app/components/admin/FlagAttendanceTable";
import { exportFlagAttendanceToExcel } from "@/services/flagExportService";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
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
  { id: "Present", label: "Present / On Time", dotColor: "bg-emerald-500" },
  { id: "Absent", label: "Late / Absent", dotColor: "bg-rose-500" },
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
    <div className="space-y-6">
      {/* 1. Header (1:1 with EventIndex Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Flag Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor ceremonial flag raising and lowering logs
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

      {/* 2. Date and Ceremony Filters Toolbar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
        {/* Search Input (EventIndex styling) */}
        <div className="flex items-center w-full xl:max-w-sm bg-card border border-border px-4 py-2.5 rounded-md text-foreground shadow-none">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search name or office..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-3 bg-transparent text-sm text-foreground font-medium outline-none placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Ceremony Type Selector */}
        <div className="w-full xl:w-52">
          <select
            value={selectedDayType}
            onChange={(e) => setSelectedDayType(e.target.value as any)}
            className="w-full bg-card border border-border px-4 py-2.5 rounded-md text-foreground text-sm font-medium outline-none cursor-pointer shadow-none"
          >
            <option value="Monday" className="bg-card text-foreground">
              Monday (Raising)
            </option>
            <option value="Friday" className="bg-card text-foreground">
              Friday (Lowering)
            </option>
          </select>
        </div>

        {/* Month Selector */}
        <div className="w-full xl:w-44">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-card border border-border px-4 py-2.5 rounded-md text-foreground text-sm font-medium outline-none cursor-pointer shadow-none"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m} className="bg-card text-foreground">
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Day Selector */}
        <div className="w-full xl:w-28">
          <select
            value={selectedDayNum}
            onChange={(e) => setSelectedDayNum(Number(e.target.value))}
            className="w-full bg-card border border-border px-4 py-2.5 rounded-md text-foreground text-sm font-medium outline-none cursor-pointer shadow-none"
          >
            {availableDates.map((d) => (
              <option key={d} value={d} className="bg-card text-foreground">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="w-full xl:w-28">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-card border border-border px-4 py-2.5 rounded-md text-foreground text-sm font-medium outline-none cursor-pointer shadow-none"
          >
            {YEARS.map((y) => (
              <option key={y} value={y} className="bg-card text-foreground">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Status Filter Tabs (matching EventIndex's FILTER_TABS pill style) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_PILLS.map((pill) => {
          const isActive = selectedStatusTab === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedStatusTab(pill.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 border cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-none"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {pill.dotColor && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-primary-foreground" : pill.dotColor
                  }`}
                />
              )}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Content Area */}
      {loading ? (
        <div className="p-12 bg-card border border-border rounded-md flex items-center justify-center shadow-none">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredData.length > 0 ? (
        <div className="bg-card border border-border rounded-md overflow-hidden shadow-none flex flex-col">
          <FlagAttendanceTable data={paginatedData} />

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
            No flag attendance records found for this date.
          </p>
        </div>
      )}
    </div>
  );
}
