"use client";

import React from "react";
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
  if (!visible || !fileUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-base font-bold text-white flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">{fileTitle}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownload(fileUrl, fileTitle)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold transition cursor-pointer"
            >
              <Download size={13} />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smart Viewer Body */}
        <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-auto p-4">
          {fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl}
              alt={fileTitle}
              className="max-w-full max-h-full object-contain rounded-lg border border-slate-800 shadow-md"
            />
          ) : fileUrl.match(/\.pdf$/i) ? (
            <iframe
              src={fileUrl}
              title={fileTitle}
              className="w-full h-full border-none rounded-lg"
            />
          ) : (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                <FileText size={32} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {fileTitle}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  This file type cannot be previewed directly in the browser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDownload(fileUrl, fileTitle)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold transition cursor-pointer"
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
