"use client";

import React from "react";

interface EventQRCodeCardProps {
  qrCode: string;
  qrImageUrl?: string;
  title?: string;
  size?: number;
}

export default function EventQRCodeCard({
  qrCode,
  qrImageUrl,
  title,
  size = 180,
}: EventQRCodeCardProps) {
  // Web fallback generator if qrImageUrl isn't provided
  const fallbackQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    `https://epasweb.vercel.app/check-in/${qrCode}`,
  )}&size=${size}&margin=2`;

  const imageSrc = qrImageUrl || fallbackQrUrl;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center my-4 shadow-sm">
      {title && (
        <span className="text-sm font-semibold text-slate-700 mb-3 text-center">
          {title}
        </span>
      )}

      <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={`QR Code: ${qrCode}`}
          style={{ width: size, height: size }}
          className="rounded-lg object-contain"
        />
      </div>

      <span className="mt-3 text-xs font-mono font-bold text-slate-500 tracking-wider">
        {qrCode}
      </span>
    </div>
  );
}
