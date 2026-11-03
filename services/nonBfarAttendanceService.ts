// services/nonBfarAttendanceService.ts
import { createClient } from "@/utils/supabase/client";
import { NonBfarAttendee, AttendanceScanType } from "@/types/attendance";

export interface GuestCheckInDTO {
  eventId: string;
  attendeeId?: string;
  fullName: string;
  organization: string;
  email?: string;
  contactNumber?: string;
  selfieFile?: File | null;
  scanType: AttendanceScanType;
}

/**
 * 1. Fetch event details (Handles QR code string or UUID)
 */
export async function getEventDetails(eventIdOrQr: string) {
  const supabase = createClient();

  // Try finding by qr_code first
  const { data: eventByQr } = await supabase
    .from("events")
    .select("*, venue:venues(*)")
    .eq("qr_code", eventIdOrQr)
    .maybeSingle();

  if (eventByQr) {
    return eventByQr;
  }

  // Fallback: Try finding by id
  const { data: eventById, error } = await supabase
    .from("events")
    .select("*, venue:venues(*)")
    .eq("id", eventIdOrQr)
    .maybeSingle();

  if (error || !eventById) {
    throw new Error("Event not found");
  }

  return eventById;
}

/**
 * 2. Fetch non-BFAR attendees for an event
 * (Automatically resolves if passed a QR code string OR a UUID)
 */
export async function getNonBfarEventAttendances(
  eventIdOrQr: string
): Promise<NonBfarAttendee[]> {
  const supabase = createClient();

  // Check if eventIdOrQr is a QR code in the events table
  const { data: eventByQr } = await supabase
    .from("events")
    .select("id")
    .eq("qr_code", eventIdOrQr)
    .maybeSingle();

  // Use the resolved event id, or the id itself
  const targetEventId = eventByQr ? eventByQr.id : eventIdOrQr;

  const { data, error } = await supabase
    .from("non_bfar_attendees")
    .select("*")
    .eq("event_id", targetEventId)
    .order("checked_in_at", { ascending: false });

  if (error) {
    console.error("Error fetching non-BFAR attendees:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  return (data as NonBfarAttendee[]) || [];
}

/**
 * 3. Upload guest selfie to "event-attachments" storage
 */
export async function uploadNonBfarSelfie(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop() || "jpg";
  const filePath = `selfies/selfie_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("event-attachments")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Selfie upload error:", uploadError);
    throw new Error("Failed to upload verification photo");
  }

  const { data } = supabase.storage
    .from("event-attachments")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * 4. Submit or update guest check-in
 */
export async function submitGuestCheckIn(dto: GuestCheckInDTO): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  let selfieUrl: string | null = null;
  if (dto.selfieFile) {
    selfieUrl = await uploadNonBfarSelfie(dto.selfieFile);
  }

  const columnMap: Record<
    AttendanceScanType,
    { timeCol: string; photoCol: string }
  > = {
    time_in: { timeCol: "checked_in_at", photoCol: "selfie_url" },
    break_out: { timeCol: "break_out_at", photoCol: "break_out_selfie_url" },
    break_in: { timeCol: "break_in_at", photoCol: "break_in_selfie_url" },
    time_out: { timeCol: "checked_out_at", photoCol: "checked_out_selfie_url" },
  };

  const { timeCol, photoCol } = columnMap[dto.scanType];

  let existingAttendee: NonBfarAttendee | null = null;

  if (dto.attendeeId) {
    const { data } = await supabase
      .from("non_bfar_attendees")
      .select("*")
      .eq("id", dto.attendeeId)
      .maybeSingle();
    existingAttendee = data as NonBfarAttendee;
  } else {
    const { data } = await supabase
      .from("non_bfar_attendees")
      .select("*")
      .eq("event_id", dto.eventId)
      .ilike("full_name", dto.fullName.trim())
      .maybeSingle();
    existingAttendee = data as NonBfarAttendee;
  }

  if (existingAttendee) {
    if ((existingAttendee as any)[timeCol]) {
      const modeLabel = dto.scanType.replace("_", " ").toUpperCase();
      throw new Error(`You have already recorded ${modeLabel} for this event.`);
    }

    const updatePayload: Record<string, any> = {
      [timeCol]: now,
    };
    if (selfieUrl) {
      updatePayload[photoCol] = selfieUrl;
    }

    const { error: updateError } = await supabase
      .from("non_bfar_attendees")
      .update(updatePayload)
      .eq("id", existingAttendee.id);

    if (updateError) throw updateError;
  } else {
    const insertPayload: Record<string, any> = {
      event_id: dto.eventId,
      full_name: dto.fullName.trim(),
      organization: dto.organization.trim(),
      email: dto.email?.trim() || null,
      contact_number: dto.contactNumber?.trim() || null,
      checked_in_at: now,
      [photoCol]: selfieUrl,
    };

    if (dto.scanType !== "time_in") {
      insertPayload[timeCol] = now;
    }

    const { error: insertError } = await supabase
      .from("non_bfar_attendees")
      .insert([insertPayload]);

    if (insertError) throw insertError;
  }
}

export const nonBfarAttendanceService = {
  getEventAttendances: getNonBfarEventAttendances,
  getEventDetails,
  uploadSelfie: uploadNonBfarSelfie,
  submitCheckIn: submitGuestCheckIn,
};