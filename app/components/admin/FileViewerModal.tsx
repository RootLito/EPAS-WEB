"use client";

import React, { useEffect } from "react";
import { FileText, Download, X } from "lucide-react";

interface FileViewerModalProps {
  visible: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileTitle: string;
  onDownload: (url: string, title: string) => void;
}

export function FileViewerModal({
  visible,
  onClose,
  fileUrl,
  fileTitle,
  onDownload,
}: FileViewerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (visible) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  if (!visible || !fileUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <div
        className="bg-card border border-border rounded-md w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-none text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{fileTitle}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownload(fileUrl, fileTitle)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition cursor-pointer"
            >
              <Download size={13} />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-background relative flex items-center justify-center overflow-auto p-4">
          {fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl}
              alt={fileTitle}
              className="max-w-full max-h-full object-contain rounded-md border border-border shadow-none"
            />
          ) : fileUrl.match(/\.pdf$/i) ? (
            <iframe
              src={fileUrl}
              title={fileTitle}
              className="w-full h-full border-none rounded-md"
            />
          ) : (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-md bg-secondary border border-border flex items-center justify-center text-primary mx-auto">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {fileTitle}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  This file type cannot be previewed directly in the browser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDownload(fileUrl, fileTitle)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition cursor-pointer"
              >
                <Download size={14} />
                <span>Download File to View</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
