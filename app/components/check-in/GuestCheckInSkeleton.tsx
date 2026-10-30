"use client";

import React from "react";

export default function GuestCheckInSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full bg-card rounded-md border border-border overflow-hidden shadow-none animate-pulse">
        {/* Header Skeleton (Matches BFAR Deep Navy Header #1e3a8a) */}
        <div className="p-6 bg-primary space-y-3">
          {/* Badge Skeleton */}
          <div className="w-32 h-4.5 bg-white/20 rounded-md" />
          {/* Title Skeleton */}
          <div className="w-3/4 h-7 bg-white/25 rounded-md" />
          {/* Venue Address Skeleton */}
          <div className="w-1/2 h-3.5 bg-white/20 rounded-md" />
        </div>

        {/* Form Body Skeleton */}
        <div className="p-6 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="w-20 h-3 bg-secondary rounded" />
            <div className="w-full h-10 bg-secondary/60 rounded-md border border-border/50" />
          </div>

          {/* Organization */}
          <div className="space-y-1.5">
            <div className="w-36 h-3 bg-secondary rounded" />
            <div className="w-full h-10 bg-secondary/60 rounded-md border border-border/50" />
          </div>

          {/* Email & Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="w-24 h-3 bg-secondary rounded" />
              <div className="w-full h-10 bg-secondary/60 rounded-md border border-border/50" />
            </div>
            <div className="space-y-1.5">
              <div className="w-28 h-3 bg-secondary rounded" />
              <div className="w-full h-10 bg-secondary/60 rounded-md border border-border/50" />
            </div>
          </div>

          {/* Photo Upload Area */}
          <div className="space-y-1.5">
            <div className="w-36 h-3 bg-secondary rounded" />
            <div className="w-full h-24 rounded-md border border-dashed border-border/70 bg-secondary/20 flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-md bg-secondary" />
              <div className="w-36 h-2.5 bg-secondary rounded" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full h-10 bg-primary rounded-md mt-2" />
        </div>
      </div>
    </div>
  );
}
