"use client";

import React from "react";
import { Search, Filter, Download, CalendarCheck, Users } from "lucide-react";

export default function EventAttendancePage() {
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm transition shadow-sm"
        >
          <Download size={16} className="text-slate-400" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by participant name, ID, or event..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 text-sm font-medium transition"
        >
          <Filter size={16} className="text-slate-400" />
          <span>Filter</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <CalendarCheck size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-300">
          No attendance logs found
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Scanned check-ins and attendance records for events will appear here.
        </p>
      </div>
    </div>
  );
}
