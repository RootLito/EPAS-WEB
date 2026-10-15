"use client";

import React from "react";
import { Search, Filter, Plus, Award } from "lucide-react";

export default function CertificatesPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-sm text-slate-400">
            Generate, issue, and manage participant certificates.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-sm"
        >
          <Plus size={16} />
          <span>Issue Certificate</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by recipient name or certificate code..."
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
          <Award size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-300">No certificates issued</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Get started by issuing your first certificate to attendees.
        </p>
      </div>
    </div>
  );
}