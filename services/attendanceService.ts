import { createClient } from "@/utils/supabase/client";
import { Attendance } from "@/types";

/**
 * Fetch all attendance logs for a specific event with user profile details, excluding admins
 */
export async function getEventAttendances(eventId: string): Promise<Attendance[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("attendances")
        .select(`
            *,
            user:users!inner (
                fullname,
                office,
                role
            )
        `)
        .eq("event_id", eventId)
        .neq("user.role", "admin")
        .order("scanned_at", { ascending: false });

    if (error) {
        console.error("Error fetching attendances:", error);
        throw error;
    }

    return data as Attendance[];
}