"use client";

import { Event } from "@/types";
import {
  Calendar,
  Edit3,
  Image as ImageIcon,
  MapPin,
  QrCode,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onImagePress?: (url: string) => void;
  onQrPress?: (event: Event) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    upcoming: {
      bg: "bg-primary/15",
      text: "text-primary",
      dot: "bg-primary",
    },
    ongoing: {
      bg: "bg-amber-500/15",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    completed: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    cancelled: {
      bg: "bg-rose-500/15",
      text: "text-rose-600",
      dot: "bg-rose-500",
    },
  };

export function EventCard({
  event,
  onPress,
  onEdit,
  onDelete,
  onImagePress,
  onQrPress,
}: EventCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const startDate = new Date(event.start_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusKey = event.status?.toLowerCase() || "upcoming";
  const badgeStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.upcoming;

  const attachments = event.attachments || [];
  const imageUrls = attachments.map((att) => att.file_url).filter(Boolean);
  const primaryImage = imageUrls[0];
  const imageCount = imageUrls.length;

  const handleImageContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageUrls.length > 0) {
      setSelectedImage(primaryImage);
      setModalVisible(true);
      onImagePress?.(primaryImage);
    }
  };

  return (
    <div
      onClick={() => onPress?.(event)}
      className="bg-card border border-border rounded-md overflow-hidden flex flex-col cursor-pointer hover:shadow-sm transition shadow-none group"
    >
      {/* Top: Picture Container (Vertical full width) */}
      <div
        onClick={handleImageContainerClick}
        className="w-full h-40 bg-background relative flex justify-center items-center overflow-hidden border-b border-border/60"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <ImageIcon size={28} className="text-muted-foreground/50" />
          </div>
        )}

        {/* Upper Left: Redesigned Clean Status Pill */}
        <div
          className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md ${badgeStyle.bg} z-10`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
          <span
            className={`text-[10px] font-bold tracking-wide capitalize ${badgeStyle.text}`}
          >
            {statusKey}
          </span>
        </div>

        {/* Bottom Right: Picture Count Overlay */}
        {imageCount > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-card/90 px-2 py-0.5 rounded-md border border-border z-10">
            <span className="text-[10px] text-foreground font-bold">
              {imageCount} {imageCount === 1 ? "pic" : "pics"}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            {/* Full title */}
            <h3 className="text-sm font-bold text-foreground tracking-tight flex-1">
              {event.title}
            </h3>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                  className="w-6 h-6 rounded-md bg-secondary border border-border hover:bg-secondary/80 flex items-center justify-center transition text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Edit3 size={12} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event);
                  }}
                  className="w-6 h-6 rounded-md bg-secondary border border-border hover:bg-rose-500/10 flex items-center justify-center transition text-rose-500 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {event.details || "No additional details provided."}
          </p>
        </div>

        {/* Venue, Date Metadata & View QR Button */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5 mb-6">
            {event.venue?.address && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-medium truncate">
                  {event.venue.address}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">
                {startDate}
              </span>
            </div>
          </div>

          {/* View QR Code Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQrPress?.(event);
            }}
            className="w-full py-2 px-3 bg-secondary hover:bg-secondary/80 border border-border rounded-md flex items-center justify-center gap-2 text-xs font-semibold text-primary transition shadow-none cursor-pointer"
          >
            <QrCode size={14} />
            <span>View QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
