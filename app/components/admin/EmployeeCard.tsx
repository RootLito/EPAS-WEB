"use client";

import { UserProfile } from "@/types/user";
import { Briefcase, Building2, ScanBarcode, User } from "lucide-react";
import React from "react";

interface EmployeeCardProps {
  item: UserProfile;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ item }) => {
  const firstName = item?.fullname?.split(" ")[0] || "User";
  const lastName = item?.fullname?.split(" ").slice(1).join(" ") || "";

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden flex flex-col justify-between hover:border-border/80 transition shadow-none group">
      {/* 1. Top Section: Big Picture, Big Name, and Code Badge */}
      <div className="p-6 flex flex-col items-center text-center w-full">
        {/* Enlarged Avatar Picture */}
        <div className="w-28 h-28 rounded-full bg-secondary border-2 border-border flex items-center justify-center mb-4 overflow-hidden shrink-0 relative">
          {item.avatar_url ? (
            <img
              src={item.avatar_url}
              alt={item.fullname}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <User size={44} className="text-muted-foreground/50" />
          )}
        </div>

        {/* Full Name Display */}
        <div className="flex flex-col items-center w-full mb-3">
          <h2 className="text-xl font-black text-foreground tracking-tight leading-tight truncate w-full text-center">
            {[firstName, lastName].filter(Boolean).join(" ")}
          </h2>
        </div>

        {/* Employee Code Badge */}
        {item.code ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary border border-border rounded-full text-xs font-mono font-semibold text-primary">
            <ScanBarcode size={13} className="shrink-0" />
            <span className="tracking-wide">{item.code}</span>
          </div>
        ) : (
          <div className="h-7" />
        )}
      </div>

      {/* 2. Full-Width Divider Line & Metadata Section */}
      <div className="w-full border-t border-border px-5 py-4 space-y-2.5">
        {/* Position */}
        <div className="flex items-center gap-2.5 w-full">
          <Briefcase size={14} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-foreground/90 font-medium truncate">
            {item.position || "No Position"}
          </span>
        </div>

        {/* Office */}
        <div className="flex items-center gap-2.5 w-full">
          <Building2 size={14} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-medium truncate">
            {item.office || "No Office Assigned"}
          </span>
        </div>
      </div>
    </div>
  );
};
