// app/components/admin/PhotoModal.tsx
"use client";

import React, { useEffect } from "react";
import { X, User } from "lucide-react";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  participantName: string;
  organization?: string;
}

export function PhotoModal({
  isOpen,
  onClose,
  imageUrl,
  participantName,
  organization,
}: PhotoModalProps) {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {participantName}
            </h3>
            {organization && (
              <p className="text-xs text-muted-foreground">{organization}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Content */}
        <div className="p-4 flex items-center justify-center bg-secondary/20 min-h-[300px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={participantName}
              className="w-full max-h-[420px] object-contain rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mb-2 stroke-[1.5]" />
              <p className="text-xs">No photo available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
