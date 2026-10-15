"use client";

import React from "react";
import { Search, Filter, Download, Flag, Users } from "lucide-react";

export default function FlagAttendancePage() {
  return (
    <div className="flex-1 flex flex-col space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flag Ceremony Attendance</h1>
          <p className="text-sm text-slate-400">
            Monitor weekly or monthly flag-raising ceremony logs.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm transition shadow-sm"
        >
          <Download size={16} className="text-slate-400" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by personnel name or department..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 text-sm font-medium transition"
        >
          <Filter size={16} className="text-slate-400" />
          <span>Filter Date</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Flag size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-300">No flag ceremony logs</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Flag ceremony attendance records will be displayed here once checked in.
        </p>
      </div>
    </div>
  );
}