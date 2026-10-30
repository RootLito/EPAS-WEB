import React from "react";
import { AlertCircle, CalendarClock, Ban, MapPin } from "lucide-react";

interface EventStatusViewProps {
  type: "invalid" | "upcoming" | "ended";
  title?: string;
  startDate?: string;
  endDate?: string;
}

export function EventStatusView({
  type,
  title,
  startDate,
  endDate,
}: EventStatusViewProps) {
  const configs = {
    invalid: {
      icon: <Ban size={28} className="text-rose-500" />,
      badgeBg: "bg-rose-500/10 border-rose-500/20",
      heading: "Invalid Event Code",
      description:
        "The event link or QR code you scanned does not exist in our system. Please check with the event coordinator.",
    },
    upcoming: {
      icon: <CalendarClock size={28} className="text-amber-500" />,
      badgeBg: "bg-amber-500/10 border-amber-500/20",
      heading: "Event Has Not Started Yet",
      description: `"${title || "This event"}" is scheduled to start on ${
        startDate ? new Date(startDate).toLocaleString() : "a later date"
      }. Check-in will open once the event officially begins.`,
    },
    ended: {
      icon: <AlertCircle size={28} className="text-muted-foreground" />,
      badgeBg: "bg-secondary border-border",
      heading: "Event Has Concluded",
      description: `"${title || "This event"}" concluded on ${
        endDate ? new Date(endDate).toLocaleString() : "a previous date"
      }. Check-in is now closed.`,
    },
  };

  const current = configs[type];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-card rounded-md border border-border overflow-hidden shadow-none">
        {/* 1. Colored Header Banner (BFAR Deep Navy #1e3a8a) */}
        <div className="p-6 bg-primary text-white space-y-2">
          <span className="inline-block text-[10px] uppercase tracking-wider bg-white/15 text-white border border-white/20 px-2.5 py-0.5 rounded-md font-bold">
            Guest Check-In Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {title || "Event Portal"}
          </h1>
        </div>

        {/* 2. Status Message Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
          {/* Centered Soft Icon Badge */}
          <div
            className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto shrink-0 ${current.badgeBg}`}
          >
            {current.icon}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {current.heading}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
