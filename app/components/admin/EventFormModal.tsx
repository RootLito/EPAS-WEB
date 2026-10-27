"use client";

import EventQRCodeCard from "@/app/components/admin/EventQRCodeCard";
import { createClient } from "@/utils/supabase/client";
import { createEvent, updateEvent } from "@/services/eventService";
import { Event } from "@/types";
import {
  Calendar,
  Clock,
  FileText,
  Layers,
  MapPin,
  Paperclip,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

interface EventFormModalProps {
  visible: boolean;
  eventToEdit?: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

const parseDateTimeToISO = (dateStr: string, timeStr: string): string => {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const d = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(d.getTime()))
      throw new Error(`Invalid date/time format: ${dateStr} ${timeStr}`);
    return d.toISOString();
  }

  let [, hoursStr, minutesStr, period] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (period.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  } else if (period.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  const isoDate = new Date(`${dateStr}T${paddedHours}:${paddedMinutes}:00`);
  if (isNaN(isoDate.getTime())) {
    throw new Error(`Invalid date values: ${dateStr} ${timeStr}`);
  }

  return isoDate.toISOString();
};

export function EventFormModal({
  visible,
  eventToEdit,
  onClose,
  onSuccess,
}: EventFormModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  // Dates
  const [startDate, setStartDate] = useState("2026-10-15");
  const [endDate, setEndDate] = useState("2026-10-15");

  // Timeline Type
  const [timelineType, setTimelineType] = useState<
    "time_in_only" | "in_out" | "in_breakout_breakin_out"
  >("in_out");

  // Time Inputs
  const [timeIn, setTimeIn] = useState("09:00 AM");
  const [timeOut, setTimeOut] = useState("05:00 PM");
  const [breakOut, setBreakOut] = useState("12:00 PM");
  const [breakIn, setBreakIn] = useState("01:00 PM");

  const [venueAddress, setVenueAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [noticeImage, setNoticeImage] = useState<string | null>(null);
  const [noticeFile, setNoticeFile] = useState<File | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setDetails(eventToEdit.details || "");

      if (eventToEdit.start_date) {
        const sd = new Date(eventToEdit.start_date);
        setStartDate(sd.toISOString().split("T")[0]);
        setTimeIn(
          sd.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        );
      }
      if (eventToEdit.end_date) {
        const ed = new Date(eventToEdit.end_date);
        setEndDate(ed.toISOString().split("T")[0]);
        setTimeOut(
          ed.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        );
      }

      // Populate break times if editing and available
      if (eventToEdit.break_out_date) {
        const bo = new Date(eventToEdit.break_out_date);
        setBreakOut(
          bo.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        );
      }
      if (eventToEdit.break_in_date) {
        const bi = new Date(eventToEdit.break_in_date);
        setBreakIn(
          bi.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        );
      }

      setTimelineType(eventToEdit.timeline_type || "in_out");
      setVenueAddress(eventToEdit.venue?.address || "");
      setLatitude(eventToEdit.venue?.latitude || null);
      setLongitude(eventToEdit.venue?.longitude || null);
      setNoticeImage(eventToEdit.attachments?.[0]?.file_url || null);
    } else {
      setTitle("");
      setDetails("");
      setStartDate("2026-10-15");
      setEndDate("2026-10-15");
      setTimelineType("in_out");
      setTimeIn("09:00 AM");
      setTimeOut("05:00 PM");
      setBreakOut("12:00 PM");
      setBreakIn("01:00 PM");
      setVenueAddress("");
      setLatitude(null);
      setLongitude(null);
      setNoticeImage(null);
      setNoticeFile(null);
    }
  }, [eventToEdit, visible]);

  if (!visible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNoticeFile(file);
      setNoticeImage(URL.createObjectURL(file));
    }
  };

  const uploadNoticeAttachment = async (file: File) => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpeg";
    const fileName = `notice_${Date.now()}.${fileExt}`;
    const filePath = `notices/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-attachments")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("event-attachments")
      .getPublicUrl(filePath);

    return {
      file_name: fileName,
      file_url: publicUrlData.publicUrl,
      size_bytes: file.size,
    };
  };

  const handleSaveEvent = async () => {
    if (!title.trim()) {
      alert("Please enter an event title.");
      return;
    }

    if (!venueAddress.trim()) {
      alert("Please enter the venue address.");
      return;
    }

    setLoading(true);

    try {
      let attachments: {
        file_name: string;
        file_url: string;
        size_bytes?: number;
      }[] = [];

      if (noticeFile) {
        const uploadedFile = await uploadNoticeAttachment(noticeFile);
        attachments.push(uploadedFile);
      } else if (noticeImage && eventToEdit?.attachments?.[0]) {
        attachments.push({
          file_name: eventToEdit.attachments[0].file_name,
          file_url: eventToEdit.attachments[0].file_url,
          size_bytes: eventToEdit.attachments[0].size_bytes,
        });
      }

      const startIso = parseDateTimeToISO(startDate, timeIn);
      const endIso =
        timelineType === "time_in_only"
          ? startIso
          : parseDateTimeToISO(endDate, timeOut);

      const payload: any = {
        title,
        details,
        start_date: startIso,
        end_date: endIso,
        timeline_type: timelineType,
        venue: {
          address: venueAddress,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
        },
        attachments,
      };

      if (timelineType === "in_breakout_breakin_out") {
        payload.break_out_date = parseDateTimeToISO(startDate, breakOut);
        payload.break_in_date = parseDateTimeToISO(startDate, breakIn);
      }

      if (eventToEdit) {
        await updateEvent({
          id: eventToEdit.id,
          venue_id: eventToEdit.venue_id,
          ...payload,
        });
      } else {
        await createEvent(payload);
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      setLoading(false);
      console.error("Failed to save event:", error);
      alert(error?.message || "Failed to save event.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        className="bg-card border border-border rounded-md w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-none text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-bold text-foreground">
            {eventToEdit ? "Edit Event" : "Create Event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-5 py-5 flex-1 space-y-5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              Basic Details
            </span>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Event Title *
                </label>
                <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Regional Leadership Summit"
                    className="flex-1 ml-2.5 bg-transparent text-foreground font-medium text-xs outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Details / Description
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Write a brief overview of the event..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-md p-2.5 text-foreground font-medium text-xs outline-none resize-none placeholder:text-muted-foreground/70"
                />
              </div>
            </div>
          </div>

          {/* 1. Start Date & End Date */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              Event Dates
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Start Date
                </label>
                <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  End Date
                </label>
                <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Timeline Type Dropdown */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              Timeline Type
            </span>
            <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
              <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={timelineType}
                onChange={(e) => setTimelineType(e.target.value as any)}
                className="flex-1 ml-2.5 bg-transparent text-foreground font-medium text-xs outline-none cursor-pointer"
              >
                <option
                  value="time_in_only"
                  className="bg-card text-foreground"
                >
                  Time in only
                </option>
                <option value="in_out" className="bg-card text-foreground">
                  Time in and time out
                </option>
                <option
                  value="in_breakout_breakin_out"
                  className="bg-card text-foreground"
                >
                  Time In, Break Out, Break In, Time Out
                </option>
              </select>
            </div>
          </div>

          {/* 3. Time Set Input */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              Time Configuration
            </span>

            {timelineType === "time_in_only" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Time In
                </label>
                <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    placeholder="09:00 AM"
                    className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                  />
                </div>
              </div>
            )}

            {timelineType === "in_out" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Time In
                  </label>
                  <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={timeIn}
                      onChange={(e) => setTimeIn(e.target.value)}
                      placeholder="09:00 AM"
                      className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Time Out
                  </label>
                  <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={timeOut}
                      onChange={(e) => setTimeOut(e.target.value)}
                      placeholder="05:00 PM"
                      className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {timelineType === "in_breakout_breakin_out" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Time In
                  </label>
                  <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={timeIn}
                      onChange={(e) => setTimeIn(e.target.value)}
                      placeholder="08:00 AM"
                      className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Break Out
                  </label>
                  <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={breakOut}
                      onChange={(e) => setBreakOut(e.target.value)}
                      placeholder="12:00 PM"
                      className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Break In
                  </label>
                  <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={breakIn}
                      onChange={(e) => setBreakIn(e.target.value)}
                      placeholder="01:00 PM"
                      className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Time Out
                  </label>
                  <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={timeOut}
                      onChange={(e) => setTimeOut(e.target.value)}
                      placeholder="05:00 PM"
                      className="flex-1 ml-2 bg-transparent text-foreground font-medium text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Venue Information */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              Venue Information
            </span>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Venue Address *
              </label>
              <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="Enter address..."
                  className="flex-1 ml-2.5 bg-transparent text-foreground font-medium text-xs outline-none placeholder:text-muted-foreground/70"
                />
              </div>
            </div>
          </div>

          {/* Notice / Memo Image Attachment */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              Notice / Memo Attachment
            </span>
            {noticeImage ? (
              <div className="relative rounded-md overflow-hidden border border-border bg-background p-2">
                <img
                  src={noticeImage}
                  alt="Notice preview"
                  className="w-full h-40 rounded-md object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setNoticeImage(null);
                    setNoticeFile(null);
                  }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-md bg-card text-foreground border border-border flex items-center justify-center hover:bg-secondary transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full h-24 rounded-md border border-dashed border-border bg-background/50 flex justify-center items-center gap-3 cursor-pointer hover:bg-secondary transition">
                <div className="w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-primary">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Attach Official Notice / Memo
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Upload image scan or document screenshot
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* QR Code Preview */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Event QR Code Generation
            </span>
            <div className="bg-background border border-border rounded-md p-4">
              <EventQRCodeCard
                qrCode={
                  title
                    ? `EVT-PREVIEW-${title.replace(/\s+/g, "").toUpperCase()}`
                    : "EVT-AUTO-GENERATED"
                }
                title="Generated Automatically on Creation"
                size={120}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-border bg-card shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-secondary hover:bg-secondary/80 border border-border py-2 rounded-md text-foreground font-semibold text-xs transition shadow-none"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveEvent}
            className="flex-1 bg-primary hover:bg-primary/90 py-2 rounded-md text-primary-foreground font-semibold text-xs transition shadow-none flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Saving...</span>
            ) : eventToEdit ? (
              "Update Event"
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
