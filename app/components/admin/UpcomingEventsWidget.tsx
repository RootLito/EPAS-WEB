"use client";

import { Event } from "@/types";
import { Calendar, Clock, MapPin } from "lucide-react";
import React from "react";

interface UpcomingEventsWidgetProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  ongoing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export function UpcomingEventsWidget({
  events,
  onSelectEvent,
}: UpcomingEventsWidgetProps) {
  const upcomingList = events.filter(
    (e) =>
      e.status?.toLowerCase() === "upcoming" ||
      e.status?.toLowerCase() === "ongoing",
  );

  return (
    <div className="bg-card border border-border rounded-md p-5 flex flex-col h-full overflow-hidden shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Upcoming & Active
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-md bg-secondary border border-border text-[11px] font-semibold text-muted-foreground">
          {upcomingList.length}
        </span>
      </div>

      {/* Scrollable list container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {upcomingList.length > 0 ? (
          upcomingList.map((event) => {
            const dateStr = new Date(event.start_date).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            );
            const statusKey = event.status?.toLowerCase() || "upcoming";
            const badgeClass =
              STATUS_COLORS[statusKey] || STATUS_COLORS.upcoming;

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="p-3.5 border border-border rounded-md hover:shadow-sm transition cursor-pointer flex flex-col gap-2.5 group shadow-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                    {event.title}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize shrink-0 ${badgeClass}`}
                  >
                    {statusKey}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  {event.venue?.address && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin
                        size={12}
                        className="shrink-0 text-muted-foreground/70"
                      />
                      <span className="truncate">{event.venue.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar
                      size={12}
                      className="shrink-0 text-muted-foreground/70"
                    />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <Calendar className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-foreground font-medium">
              No upcoming events
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scheduled events will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
