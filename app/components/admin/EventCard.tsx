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
      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col cursor-pointer hover:border-slate-700 transition shadow-sm group"
    >
      {/* Top: Picture Container (Vertical full width) */}
      <div
        onClick={handleImageContainerClick}
        className="w-full h-40 bg-slate-900 relative flex justify-center items-center overflow-hidden"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <ImageIcon size={28} className="text-slate-600" />
          </div>
        )}

        {/* Upper Left: Status Badge Overlay */}
        <div
          className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeStyle.bg} backdrop-blur-md border border-slate-800/50 z-10`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
          <span
            className={`text-[10px] font-bold capitalize ${badgeStyle.text}`}
          >
            {statusKey}
          </span>
        </div>

        {/* Bottom Right: Picture Count Overlay */}
        {imageCount > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800 z-10">
            <span className="text-[10px] text-slate-300 font-bold">
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
            <h3 className="text-base font-bold text-white tracking-tight flex-1">
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
                  className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 flex items-center justify-center transition text-slate-300"
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
                  className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/50 flex items-center justify-center transition text-rose-400"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2">
            {event.details || "No additional details provided."}
          </p>
        </div>

        {/* Venue, Date Metadata & View QR Button */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5 mb-6">
            {event.venue?.address && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-500 shrink-0" />
                <span className="text-xs text-slate-400 font-medium truncate">
                  {event.venue.address}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500 shrink-0" />
              <span className="text-xs text-slate-400 font-medium">
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
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-blue-400 transition"
          >
            <QrCode size={14} />
            <span>View QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
