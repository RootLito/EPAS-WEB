"use client";

import React, { useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";

interface EventQRCodeCardProps {
  qrCode: string;
  qrImageUrl?: string;
  title?: string;
  subtitle?: string;
  size?: number;
}

export default function EventQRCodeCard({
  qrCode,
  qrImageUrl,
  title,
  subtitle = "Scan to record attendance",
  size = 180,
}: EventQRCodeCardProps) {
  const [copied, setCopied] = useState(false);

  // Fallback QR generator if no image URL is supplied
  const fallbackQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    `https://epasweb.vercel.app/check-in/${qrCode}`,
  )}&size=${size}&margin=2`;

  const imageSrc = qrImageUrl || fallbackQrUrl;

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-md p-5 flex flex-col items-center justify-center text-center space-y-4 shadow-none">
      {/* Header Info */}
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-sm font-bold text-foreground tracking-tight">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {/* QR Code Container 
          (QR codes need a crisp white background so cameras can scan them in both dark & light mode) */}
      <div className="p-3 bg-white border border-border rounded-md flex items-center justify-center shadow-none">
        <img
          src={imageSrc}
          alt={`QR Code: ${qrCode}`}
          style={{ width: size, height: size }}
          className="object-contain"
        />
      </div>

      {/* Code Badge with Click-to-Copy */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          type="button"
          onClick={handleCopyCode}
          className="group flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border rounded-md text-xs font-mono font-semibold text-foreground transition cursor-pointer"
          title="Click to copy QR string"
        >
          <QrCode
            size={13}
            className="text-muted-foreground group-hover:text-foreground transition"
          />
          <span className="tracking-wider">{qrCode}</span>
          {copied ? (
            <Check size={12} className="text-emerald-500 ml-1" />
          ) : (
            <Copy
              size={12}
              className="text-muted-foreground group-hover:text-foreground transition ml-1"
            />
          )}
        </button>
        <span className="text-[10px] text-muted-foreground">
          {copied ? "Copied to clipboard!" : "Click code to copy"}
        </span>
      </div>
    </div>
  );
}
