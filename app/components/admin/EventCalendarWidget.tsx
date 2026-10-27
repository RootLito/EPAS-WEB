"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import breezyThemePlugin from "@fullcalendar/react/themes/breezy";
import { EventClickInfo } from "@fullcalendar/react";

// Required FullCalendar v7 stylesheets
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/breezy/theme.css";
import "@fullcalendar/react/themes/breezy/palettes/indigo.css";

import { Event } from "@/types";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const calendarEvents = events
    .filter((ev) => ev.start_date)
    .map((ev) => ({
      id: ev.id,
      title: ev.title,
      start: ev.start_date,
      end: ev.end_date || ev.start_date,
      extendedProps: ev,
    }));

  const handleDateClick = (arg: { date: Date; dateStr: string }) => {
    const dayEvents = events.filter((ev) =>
      ev.start_date?.startsWith(arg.dateStr),
    );
    onSelectDate?.(arg.date, dayEvents);
    if (dayEvents.length > 0 && onSelectEvent) {
      onSelectEvent(dayEvents[0]);
    }
  };

  const handleEventClick = (arg: EventClickInfo) => {
    const eventData = arg.event.extendedProps as Event;
    onSelectEvent?.(eventData);
  };

  if (!mounted) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col h-full shadow-none">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Event Calendar</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col h-full shadow-none overflow-hidden">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <CalendarIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Event Calendar</h3>
      </div>

      {/* Explicit style overrides targeting FullCalendar v7 buttons, active states, and event chips */}
      <div
        className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs 
        [&_.fc-toolbar-title]:text-sm [&_.fc-toolbar-title]:font-bold [&_.fc-toolbar-title]:text-foreground 
        [&_.fc-button]:bg-secondary [&_.fc-button]:text-foreground [&_.fc-button]:border-border/60 [&_.fc-button]:rounded-lg [&_.fc-button:hover]:bg-primary/10 [&_.fc-button:hover]:text-primary 
        [&_.fc-button-active]:bg-primary! [&_.fc-button-active]:text-primary-foreground! [&_.fc-button-active]:border-primary!
        [&_.fc-daygrid-day-number]:text-foreground [&_.fc-col-header-cell-cushion]:text-muted-foreground [&_.fc-col-header-cell-cushion]:font-medium
        [&_.fc-event]:bg-primary/15 [&_.fc-event]:text-primary [&_.fc-event]:border-transparent [&_.fc-event]:rounded-md [&_.fc-event]:px-1.5 [&_.fc-event]:py-0.5 [&_.fc-event]:font-medium"
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, breezyThemePlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
          dayMaxEvents={2}
          fixedWeekCount={false}
        />
      </div>
    </div>
  );
}
