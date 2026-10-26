import { createClient } from "@/utils/supabase/client";

export interface FlagAttendanceRow {
    id: string;
    client_id: string;
    code: string;
    ceremony_type: string;
    status: string;
    scan_date: string;
    scan_time: string;
    user: {
        id: string;
        fullname: string;
        office: string;
        role: string;
        code: string;
    };
}

export async function getFlagAttendances(
    ceremonyType: string,
    targetDate: string
): Promise<FlagAttendanceRow[]> {
    const supabase = createClient();

    // 1. Fetch all non-admin users
    const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, fullname, office, role, code")
        .neq("role", "admin")
        .order("fullname", { ascending: true });

    if (userError) {
        console.error("Error fetching users:", userError.message);
        throw userError;
    }

    // 2. Fetch attendance records for target date and ceremony
    const { data: attendanceRecords, error: attError } = await supabase
        .from("flag_attendance")
        .select("*, user:users(id, fullname, office, role, code)")
        .eq("scan_date", targetDate)
        .eq("ceremony_type", ceremonyType);

    if (attError) {
        console.error("Error fetching flag attendance:", attError.message);
        throw attError;
    }

    // 3. Map attendance records
    const attendanceMap = new Map();
    (attendanceRecords || []).forEach((record) => {
        attendanceMap.set(`${record.client_id}_${record.ceremony_type}_${record.scan_date}`, record);
    });

    // 4. Merge users with attendance or default to Absent
    const completeList: FlagAttendanceRow[] = (users || []).map((user) => {
        const key = `${user.id}_${ceremonyType}_${targetDate}`;
        const existingRecord = attendanceMap.get(key);

        if (existingRecord) {
            return existingRecord;
        }

        return {
            id: `absent-${user.id}-${targetDate}`,
            client_id: user.id,
            code: user.code || "",
            ceremony_type: ceremonyType,
            status: "Absent",
            scan_date: targetDate,
            scan_time: "",
            user: user,
        };
    });

    return completeList;
}