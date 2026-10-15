"use client";

import React from "react";
import { QrCode, X } from "lucide-react";
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
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-sm w-full relative shadow-2xl flex flex-col items-center text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-3 mb-2 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Event QR Code</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Card Content */}
        <div className="w-full">
          <EventQRCodeCard
            qrCode={qrCode}
            qrImageUrl={qrImageUrl}
            title={eventTitle}
            size={180}
          />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
