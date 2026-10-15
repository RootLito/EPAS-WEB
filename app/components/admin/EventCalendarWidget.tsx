"use client";

import { Calendar } from "@/components/ui/calendar";
import { Event } from "@/types";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

interface EventCalendarWidgetProps {
  events: Event[];
  onSelectEvent?: (event: Event) => void;
  onSelectDate?: (date: Date, dayEvents: Event[]) => void;
}

export function EventCalendarWidget({
  events,
  onSelectEvent,
  onSelectDate,
}: EventCalendarWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    setDate(new Date());
  }, []);

  // Map events using date-fns formatted keys (YYYY-MM-DD)
  const eventMap = events.reduce((acc: Record<string, Event[]>, ev) => {
    if (!ev.start_date) return acc;
    const dateKey = format(parseISO(ev.start_date), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(ev);
    return acc;
  }, {});

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const dayEvents = eventMap[dateKey] || [];

    onSelectDate?.(selectedDate, dayEvents);

    if (dayEvents.length > 0 && onSelectEvent) {
      onSelectEvent(dayEvents[0]);
    }
  };

  // Prevent server-side prerendering of the DayPicker component
  if (!mounted) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <CalendarIcon className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Event Calendar</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <CalendarIcon className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-bold text-white">Event Calendar</h3>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 flex items-center justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-white shadow-sm w-full flex justify-center [&_table]:w-full [&_td]:text-center [&_button]:w-9 [&_button]:h-9"
          modifiers={{
            hasEvent: (day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              return !!eventMap[dateKey]?.length;
            },
          }}
          modifiersClassNames={{
            hasEvent:
              "bg-blue-500/20 text-blue-300 font-bold rounded-full hover:bg-blue-500/30 transition-colors",
          }}
        />
      </div>
    </div>
  );
}
