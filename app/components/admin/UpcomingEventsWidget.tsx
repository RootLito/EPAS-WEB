// app/components/admin/UpcomingEventsWidget.tsx
"use client";

import { Event } from "@/types";
import { eventClassificationService } from "@/services/eventClassificationService";
import { Calendar, Clock, MapPin, Radio } from "lucide-react";
import React, { useMemo } from "react";

interface UpcomingEventsWidgetProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export function UpcomingEventsWidget({
  events,
  onSelectEvent,
}: UpcomingEventsWidgetProps) {
  // Use eventClassificationService to separate and sort Ongoing and Upcoming events
  const { ongoing, upcoming } = useMemo(() => {
    const grouped = eventClassificationService.groupEvents(events);

    // Sort upcoming events chronologically (earliest first)
    grouped.upcoming.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    );

    return {
      ongoing: grouped.ongoing,
      upcoming: grouped.upcoming,
    };
  }, [events]);

  const totalActive = ongoing.length + upcoming.length;

  return (
    <div className="bg-card border border-border rounded-md p-5 flex flex-col h-full overflow-hidden shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Active & Upcoming
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-md bg-secondary border border-border text-[11px] font-semibold text-muted-foreground">
          {totalActive}
        </span>
      </div>

      {/* Scrollable list container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {/* 1. ONGOING EVENTS SECTION (If any active right now) */}
        {ongoing.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 px-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Happening Now ({ongoing.length})
              </span>
            </div>

            {ongoing.map((event) => {
              const dateStr = new Date(event.start_date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                },
              );

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="p-3 border border-amber-500/30 bg-amber-500/5 rounded-md hover:bg-amber-500/10 transition cursor-pointer flex flex-col gap-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-amber-600 transition line-clamp-2">
                      {event.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-amber-500/15 text-amber-600 border-amber-500/30 uppercase shrink-0">
                      Ongoing
                    </span>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-amber-500/20 text-[11px] text-muted-foreground">
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
            })}
          </div>
        )}

        {/* 2. UPCOMING EVENTS SECTION */}
        {upcoming.length > 0 && (
          <div className="space-y-2.5">
            {ongoing.length > 0 && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1 block pt-1">
                Scheduled Ahead ({upcoming.length})
              </span>
            )}

            {upcoming.map((event) => {
              const dateStr = new Date(event.start_date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="p-3 border border-border rounded-md hover:border-primary/50 hover:bg-secondary/30 transition cursor-pointer flex flex-col gap-2 group shadow-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                      {event.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-primary/10 text-primary border-primary/20 uppercase shrink-0">
                      Upcoming
                    </span>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-border/60 text-[11px] text-muted-foreground">
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
            })}
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {totalActive === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <Calendar className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-foreground font-semibold">
              No Active or Upcoming Events
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scheduled events will automatically appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
