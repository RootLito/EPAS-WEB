// app/(admin)/dashboard/page.tsx
"use client";

import { EventCalendarWidget } from "@/app/components/admin/EventCalendarWidget";
import { UpcomingEventsWidget } from "@/app/components/admin/UpcomingEventsWidget";
import { EventDetailModal } from "@/app/components/admin/EventDetailModal";
import { DashboardStats, getDashboardStats } from "@/services/dashboardService";
import { getEvents } from "@/services/eventService";
import { eventClassificationService } from "@/services/eventClassificationService";
import { Event } from "@/types";
import { Calendar, CheckCircle2, Clock, Layers } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    completedEvents: 0,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State Management
  const [selectedEventToView, setSelectedEventToView] = useState<Event | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statData, eventData] = await Promise.all([
          getDashboardStats(),
          getEvents(),
        ]);

        // 1. Enrich events using real-time date classification
        const enrichedEvents = eventClassificationService.enrichEvents(
          eventData || [],
        );
        const classified =
          eventClassificationService.groupEvents(enrichedEvents);

        // 2. Real-time dynamic stats calculation
        setStats({
          totalEvents: enrichedEvents.length,
          upcomingEvents: classified.upcoming.length,
          ongoingEvents: classified.ongoing.length,
          completedEvents: classified.completed.length,
        });

        setEvents(enrichedEvents);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statsConfig = [
    {
      name: "Total Events",
      value: stats.totalEvents.toString(),
      icon: Layers,
      change: "All registered events",
      textColor: "text-primary",
    },
    {
      name: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      icon: Calendar,
      change: "Scheduled ahead",
      textColor: "text-primary",
    },
    {
      name: "Ongoing Events",
      value: stats.ongoingEvents.toString(),
      icon: Clock,
      change: "Active right now",
      textColor: "text-amber-500",
    },
    {
      name: "Completed Events",
      value: stats.completedEvents.toString(),
      icon: CheckCircle2,
      change: "Successfully finished",
      textColor: "text-emerald-500",
    },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-visible lg:overflow-hidden space-y-6">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="hidden text-xs sm:block sm:text-sm text-muted-foreground">
          Welcome back! Here is a summary of your portal activities.
        </p>
      </div>

      {/* Quick Stats: 2x2 Grid on Mobile/Tablet, 4 Columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-3.5 sm:p-5 bg-card border border-border rounded-md space-y-2.5 sm:space-y-3 shadow-none flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                {/* Text wraps underneath cleanly without cutting off */}
                <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug break-words">
                  {stat.name}
                </h3>
                <div
                  className={`p-1.5 sm:p-2 bg-secondary border border-border rounded-md shrink-0 ${stat.textColor}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {loading ? "..." : stat.value}
                </div>
                {/* Description flows underneath naturally without ellipsis */}
                <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-normal break-words">
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Calendar (3 cols) & Upcoming/Ongoing List (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Event Calendar Widget */}
        <div className="lg:col-span-3 h-full min-h-[480px] lg:min-h-0 overflow-x-auto">
          <EventCalendarWidget
            events={events}
            onSelectEvent={(selectedEvent) => {
              setSelectedEventToView(selectedEvent);
              setIsDetailModalOpen(true);
            }}
          />
        </div>

        {/* Dynamic Ongoing & Upcoming Events List */}
        <div className="lg:col-span-1 h-full min-h-0">
          <UpcomingEventsWidget
            events={events}
            onSelectEvent={(selectedEvent) => {
              setSelectedEventToView(selectedEvent);
              setIsDetailModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Event Detail Modal Component */}
      <EventDetailModal
        event={selectedEventToView}
        visible={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEventToView(null);
        }}
      />
    </div>
  );
}
