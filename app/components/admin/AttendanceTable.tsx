// app/components/admin/AttendanceTable.tsx
"use client";

import React, { useState } from "react";
import { PhotoModal } from "@/app/components/admin/PhotoModal";
import { AttendanceRow } from "@/types/attendance";

interface AttendanceTableProps {
  data: AttendanceRow[];
}

interface ScanSlotProps {
  label: string;
  time: string | null;
  photoUrl?: string | null;
  onPhotoClick?: (url: string) => void;
}

function ScanSlot({ time, photoUrl, onPhotoClick }: ScanSlotProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formattedTime = formatTime(time);

  return (
    <div className="flex flex-col items-center gap-1.5 w-16">
      {/* Photo or Dashed "No Log" Box */}
      {photoUrl ? (
        <button
          type="button"
          onClick={() => onPhotoClick?.(photoUrl)}
          className="w-16 h-16 rounded-xl overflow-hidden border border-border hover:ring-2 hover:ring-primary/60 transition cursor-pointer shrink-0 bg-secondary shadow-xs group"
          title="Click to expand photo"
        >
          <img
            src={photoUrl}
            alt="Scan Photo"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
          />
        </button>
      ) : (
        <div className="w-16 h-16 rounded-xl border border-dashed border-border/80 bg-secondary/15 flex items-center justify-center shrink-0">
          <span className="text-[11px] text-muted-foreground/70 font-normal">
            No Log
          </span>
        </div>
      )}

      {/* Time Text or Dash */}
      <span className="text-xs font-semibold text-foreground/90 whitespace-nowrap">
        {formattedTime || "—"}
      </span>
    </div>
  );
}

export function AttendanceTable({ data }: AttendanceTableProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string | null;
    name: string;
    org: string;
  } | null>(null);

  const openModal = (url: string, name: string, org: string) => {
    setSelectedPhoto({ url, name, org });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-card text-muted-foreground text-xs font-semibold">
              <th className="py-4 px-5">Name</th>
              <th className="py-4 px-5">Office</th>
              <th className="py-4 px-4 text-center">Time In</th>
              <th className="py-4 px-4 text-center">Break Out</th>
              <th className="py-4 px-4 text-center">Break In</th>
              <th className="py-4 px-4 text-center">Time Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {data.map((row) => (
              <tr key={row.userId} className="hover:bg-secondary/40 transition">
                {/* Employee Name */}
                <td className="py-4 px-5 font-bold text-foreground align-middle">
                  {row.name}
                </td>

                {/* Office */}
                <td className="py-4 px-5 text-muted-foreground text-xs md:text-sm align-middle">
                  {row.office || "—"}
                </td>

                {/* Time In */}
                <td className="py-4 px-4 align-middle">
                  <div className="flex justify-center">
                    <ScanSlot
                      label="Time In"
                      time={row.time_in}
                      photoUrl={row.time_in_photo}
                      onPhotoClick={(url) =>
                        openModal(url, row.name, row.office)
                      }
                    />
                  </div>
                </td>

                {/* Break Out */}
                <td className="py-4 px-4 align-middle">
                  <div className="flex justify-center">
                    <ScanSlot
                      label="Break Out"
                      time={row.break_out}
                      photoUrl={row.break_out_photo}
                      onPhotoClick={(url) =>
                        openModal(url, row.name, row.office)
                      }
                    />
                  </div>
                </td>

                {/* Break In */}
                <td className="py-4 px-4 align-middle">
                  <div className="flex justify-center">
                    <ScanSlot
                      label="Break In"
                      time={row.break_in}
                      photoUrl={row.break_in_photo}
                      onPhotoClick={(url) =>
                        openModal(url, row.name, row.office)
                      }
                    />
                  </div>
                </td>

                {/* Time Out */}
                <td className="py-4 px-4 align-middle">
                  <div className="flex justify-center">
                    <ScanSlot
                      label="Time Out"
                      time={row.time_out}
                      photoUrl={row.time_out_photo}
                      onPhotoClick={(url) =>
                        openModal(url, row.name, row.office)
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal View */}
      <PhotoModal
        isOpen={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        imageUrl={selectedPhoto?.url || null}
        participantName={selectedPhoto?.name || ""}
        organization={selectedPhoto?.org}
      />
    </>
  );
}
