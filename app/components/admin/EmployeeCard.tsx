"use client";

import { UserProfile } from "@/types/user";
import { Briefcase, Building2, QrCode, User } from "lucide-react";
import React from "react";

interface EmployeeCardProps {
  item: UserProfile;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ item }) => {
  const firstName = item?.fullname?.split(" ")[0] || "User";
  const lastName = item?.fullname?.split(" ").slice(1).join(" ") || "";

  return (
    <div className="w-full p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm flex flex-col items-center hover:border-slate-700 transition">
      {/* Enlarged Centered Avatar */}
      <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center mb-4 overflow-hidden border-2 border-slate-800 relative shadow-inner">
        {item.avatar_url ? (
          <img
            src={item.avatar_url}
            alt={item.fullname}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={42} className="text-slate-500" />
        )}
      </div>

      {/* Enlarged Split Name */}
      <div className="flex flex-col items-center mb-2 w-full text-center">
        <h2 className="text-2xl font-black text-white tracking-tight leading-tight truncate w-full">
          {firstName}
        </h2>
        {lastName ? (
          <p className="text-2xl font-light text-slate-400 tracking-tight leading-tight truncate w-full mt-0.5">
            {lastName}
          </p>
        ) : null}
      </div>

      {/* Employee Code Badge */}
      {item.code && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full mb-4 text-xs font-mono font-semibold text-blue-400">
          <QrCode size={13} />
          <span>{item.code}</span>
        </div>
      )}

      {/* Metadata Section */}
      <div className="w-full space-y-2.5 pt-3 border-t border-slate-900">
        {/* Position */}
        <div className="flex items-center w-full px-1">
          <Briefcase size={15} className="text-slate-500 shrink-0" />
          <span className="text-xs text-slate-300 font-medium ml-2 truncate">
            {item.position || "No Position"}
          </span>
        </div>

        {/* Office */}
        <div className="flex items-center w-full px-1">
          <Building2 size={15} className="text-slate-500 shrink-0" />
          <span className="text-xs text-slate-400 font-medium ml-2 truncate">
            {item.office || "No Office Assigned"}
          </span>
        </div>
      </div>
    </div>
  );
};
