"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  createCertificate,
  updateCertificate,
} from "@/services/certificateService";
import { Event } from "@/types"; // adjust path as needed
import { Award, FileText, Layers, Paperclip, X } from "lucide-react";

interface CertificateFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // Pass existing data when updating
}

export function CertificateFormModal({
  visible,
  onClose,
  onSuccess,
  initialData = null,
}: CertificateFormModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const [eventId, setEventId] = useState("");
  const [fileName, setFileName] = useState("");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState<string | null>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (visible) {
      fetchEvents();
      if (initialData) {
        setEventId(initialData.event_id || "");
        setFileName(initialData.file_name || "");
        setCertificateFile(null);
        setFilePreviewName(
          initialData.file_url ? initialData.file_url.split("/").pop() : null,
        );
      } else {
        setEventId("");
        setFileName("");
        setCertificateFile(null);
        setFilePreviewName(null);
      }
    }
  }, [visible, initialData]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (!initialData && data && data.length > 0) {
        setEventId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load events for dropdown:", err);
    }
  };

  if (!visible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificateFile(file);
      setFilePreviewName(file.name);
      if (!fileName) {
        setFileName(
          file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (!eventId) {
      alert("Please select an event.");
      return;
    }
    if (!fileName.trim()) {
      alert("Please enter a file title.");
      return;
    }
    if (!isEditing && !certificateFile) {
      alert("Please upload a file.");
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        // If your service has an update function, call it here:
        // await updateCertificate(initialData.id, { event_id: eventId, file_name: fileName.trim() }, certificateFile);

        // Fallback / standard implementation pattern:
        await updateCertificate(
          initialData.id,
          {
            event_id: eventId,
            file_name: fileName.trim(),
            ...(certificateFile ? { size_bytes: certificateFile.size } : {}),
          },
          certificateFile,
        );
      } else {
        await createCertificate(
          {
            event_id: eventId,
            file_name: fileName.trim(),
            file_url: "",
            size_bytes: certificateFile?.size || 0,
          },
          certificateFile!,
        );
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      setLoading(false);
      console.error("Failed to save file:", error);
      alert(error?.message || "Failed to save file.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            {isEditing ? "Update File" : "Add File to System"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Select Event Dropdown */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Select Event <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <Layers className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="flex-1 ml-2.5 bg-transparent text-white font-medium text-sm outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-slate-900">
                  Select an event...
                </option>
                {events.map((evt) => (
                  <option
                    key={evt.id}
                    value={evt.id}
                    className="bg-slate-900 text-white"
                  >
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              File Title <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Event Guidelines Document"
                className="flex-1 ml-2.5 bg-transparent text-white font-medium text-sm outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Upload File */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              {isEditing ? "Replace File (Optional)" : "Upload File"}{" "}
              <span className={!isEditing ? "text-red-400" : "text-slate-500"}>
                *
              </span>
            </label>
            {filePreviewName ? (
              <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-white block truncate">
                      {filePreviewName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isEditing && !certificateFile
                        ? "Existing file attached"
                        : "Ready to upload"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCertificateFile(null);
                    setFilePreviewName(null);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition shrink-0 ml-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full h-28 rounded-xl border border-dashed border-slate-800 bg-slate-900/50 flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-slate-900 transition">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Click to browse file
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    PDF, PNG, or JPG formats accepted
                  </span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2.5 rounded-xl text-slate-300 font-semibold text-sm transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-white font-semibold text-sm transition shadow-sm flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <span className="animate-pulse">Saving...</span>
            ) : isEditing ? (
              "Update File"
            ) : (
              "Add to System"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
