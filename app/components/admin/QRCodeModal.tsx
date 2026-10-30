"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import EventQRCodeCard from "./EventQRCodeCard";

interface QRCodeModalProps {
  visible: boolean;
  qrCode: string;
  qrImageUrl?: string;
  eventTitle?: string;
  onClose: () => void;
}

export function QRCodeModal({
  visible,
  qrCode,
  qrImageUrl,
  eventTitle,
  onClose,
}: QRCodeModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (visible) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        className="bg-card border border-border rounded-md w-full max-w-sm flex flex-col overflow-hidden shadow-none text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Exact Header from EventFormModal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-bold text-foreground">
            Event QR Code
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col items-center">
          <EventQRCodeCard
            qrCode={qrCode}
            qrImageUrl={qrImageUrl}
            title={eventTitle}
            size={180}
          />
        </div>

        {/* Modal Footer (matches Cancel button in EventFormModal) */}
        <div className="px-5 py-4 border-t border-border bg-card shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-secondary hover:bg-secondary/80 border border-border py-2 rounded-md text-foreground font-semibold text-xs transition shadow-none cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}