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
  const [startDate, setStartDate] = useState("2026-10-15");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endDate, setEndDate] = useState("2026-10-15");
  const [endTime, setEndTime] = useState("05:00 PM");

  const [timelineType, setTimelineType] = useState<
    "in_out" | "in_breakout_breakin_out"
  >("in_out");

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
        setStartTime(
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
        setEndTime(
          ed.toLocaleTimeString("en-US", {
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
      setStartTime("09:00 AM");
      setEndDate("2026-10-15");
      setEndTime("05:00 PM");
      setTimelineType("in_out");
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

      const startIso = parseDateTimeToISO(startDate, startTime);
      const endIso = parseDateTimeToISO(endDate, endTime);

      if (eventToEdit) {
        await updateEvent({
          id: eventToEdit.id,
          venue_id: eventToEdit.venue_id,
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
        });
      } else {
        await createEvent({
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
        });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-white">
            {eventToEdit ? "Edit Event" : "Create Event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-6 py-6 flex-1 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              Basic Details
            </span>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Event Title *
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Regional Leadership Summit"
                    className="flex-1 ml-2.5 bg-transparent text-white font-medium text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Details / Description
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Write a brief overview of the event..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-medium text-sm outline-none resize-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Timeline Type */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              Timeline Type
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTimelineType("in_out")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  timelineType === "in_out"
                    ? "bg-slate-900 border-slate-700 text-white shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="font-semibold text-xs">Standard (In/Out)</span>
              </button>

              <button
                type="button"
                onClick={() => setTimelineType("in_breakout_breakin_out")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  timelineType === "in_breakout_breakin_out"
                    ? "bg-slate-900 border-slate-700 text-white shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="font-semibold text-xs">With Breakouts</span>
              </button>
            </div>
          </div>

          {/* Schedule & Timing */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              Schedule & Timing
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Start Date
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 ml-2 bg-transparent text-white font-medium text-xs outline-none color-scheme-dark"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Start Time
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="flex-1 ml-2 bg-transparent text-white font-medium text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  End Date
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 ml-2 bg-transparent text-white font-medium text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  End Time
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="05:00 PM"
                    className="flex-1 ml-2 bg-transparent text-white font-medium text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Venue Information */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              Venue Information
            </span>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Venue Address *
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="Enter address..."
                  className="flex-1 ml-2.5 bg-transparent text-white font-medium text-sm outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Notice / Memo Image Attachment */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              Notice / Memo Attachment
            </span>
            {noticeImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-2">
                <img
                  src={noticeImage}
                  alt="Notice preview"
                  className="w-full h-44 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setNoticeImage(null);
                    setNoticeFile(null);
                  }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-950/80 text-white border border-slate-800 flex items-center justify-center hover:bg-slate-900 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full h-24 rounded-xl border border-dashed border-slate-800 bg-slate-900/50 flex justify-center items-center gap-3 cursor-pointer hover:bg-slate-900 transition">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Attach Official Notice / Memo
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Event QR Code Generation
            </span>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
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
        <div className="flex gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2.5 rounded-xl text-slate-300 font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveEvent}
            className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-white font-semibold text-sm transition shadow-sm flex items-center justify-center"
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
