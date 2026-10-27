"use client";

import { Event } from "@/types";
import { X } from "lucide-react";
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

  const statusText = event.status ? event.status.toUpperCase() : "UPCOMING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-5">
      <div
        className="bg-card border border-border rounded-md w-full max-w-md max-h-[85%] flex flex-col overflow-hidden shadow-none text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border shrink-0">
          <span className="text-xs font-bold text-muted-foreground tracking-wider">
            {statusText}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-5 pt-4 space-y-4">
          <h2 className="text-xl font-bold text-foreground">{event.title}</h2>

          {event.details && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">
                Details
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.details}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-xs font-bold text-foreground block">
              Date & Time
            </span>
            <p className="text-xs text-muted-foreground">
              {startDate}
              {endDate && endDate !== startDate ? ` - ${endDate}` : ""} (
              {startTime}
              {endTime ? ` - ${endTime}` : ""})
            </p>
          </div>

          {event.venue?.address && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">
                Venue
              </span>
              <p className="text-xs text-muted-foreground">
                {event.venue.address}
              </p>
            </div>
          )}

          {event.attachments && event.attachments.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">
                Attachments ({event.attachments.length})
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {event.attachments.map((att) => (
                  <button
                    key={att.id || att.file_url}
                    type="button"
                    onClick={() => onImagePress?.(att.file_url)}
                    className="rounded-md overflow-hidden border border-border bg-background transition hover:border-primary/50"
                  >
                    <img
                      src={att.file_url}
                      alt={att.file_name}
                      className="w-16 h-16 object-cover"
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
