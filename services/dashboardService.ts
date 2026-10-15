import { createClient } from "@/utils/supabase/client";

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  const { data, error } = await supabase.from("events").select("status");

  if (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }

  const events = data || [];
  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => e.status?.toLowerCase() === "upcoming").length;
  const ongoingEvents = events.filter((e) => e.status?.toLowerCase() === "ongoing").length;
  const completedEvents = events.filter((e) => e.status?.toLowerCase() === "completed").length;

  return {
    totalEvents,
    upcomingEvents,
    ongoingEvents,
    completedEvents,
  };
}