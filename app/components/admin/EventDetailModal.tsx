"use client";

import { Event } from "@/types";
import { Calendar, Clock, FileText, MapPin, Paperclip, X } from "lucide-react";
import React from "react";

interface EventWithDetails extends Event {
  details?: string;
}

interface EventDetailModalProps {
  visible: boolean;
  event: EventWithDetails | null;
  onClose: () => void;
  onImagePress?: (url: string) => void;
  onQrPress?: (event: Event) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    upcoming: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      dot: "bg-blue-500",
    },
    ongoing: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      dot: "bg-amber-500",
    },
    completed: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      dot: "bg-emerald-500",
    },
    cancelled: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      dot: "bg-rose-500",
    },
  };

export function EventDetailModal({
  visible,
  event,
  onClose,
  onImagePress,
}: EventDetailModalProps) {
  if (!visible || !event) return null;

  const startDate = new Date(event.start_date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const startTime = new Date(event.start_date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endDate = event.end_date
    ? new Date(event.end_date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const endTime = event.end_date
    ? new Date(event.end_date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const statusKey = event.status?.toLowerCase() || "upcoming";
  const badgeStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.upcoming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-5">
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md max-h-[85%] flex flex-col overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-900 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${badgeStyle.bg} border border-slate-800/50`}
          >
            <div className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
            <span className={`text-xs font-bold capitalize ${badgeStyle.text}`}>
              {statusKey}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-6 pt-4 space-y-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {event.title}
          </h2>

          {/* Details Box */}
          {event.details && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-300">
                  Details
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {event.details}
                </p>
              </div>
            </div>
          )}

          {/* Date & Time Box */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-300">
                Date & Time
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <Calendar size={16} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Date
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {startDate}
                    {endDate && endDate !== startDate ? ` - ${endDate}` : ""}
                  </span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <Clock size={16} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Time
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {startTime} {endTime ? ` - ${endTime}` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Box */}
          {event.venue?.address && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-300">Venue</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Location
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {event.venue.address}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Attachments Box */}
          {event.attachments && event.attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Paperclip size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-300">
                  Attachments ({event.attachments.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {event.attachments.map((att) => (
                  <button
                    key={att.id || att.file_url}
                    type="button"
                    onClick={() => onImagePress?.(att.file_url)}
                    className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm transition hover:opacity-90"
                  >
                    <img
                      src={att.file_url}
                      alt={att.file_name}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
