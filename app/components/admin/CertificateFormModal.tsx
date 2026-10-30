"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  createCertificate,
  updateCertificate,
} from "@/services/certificateService";
import { Event } from "@/types";
import { Award, FileText, Layers, Paperclip, X } from "lucide-react";

interface CertificateFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        className="bg-card border border-border rounded-md w-full max-w-lg flex flex-col overflow-hidden shadow-none text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Exact EventFormModal styling) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            {isEditing ? "Update File" : "Add File to System"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Select Event */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Select Event *
            </label>
            <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
              <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="flex-1 ml-2.5 bg-transparent text-foreground font-medium text-xs outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-card text-foreground">
                  Select an event...
                </option>
                {events.map((evt) => (
                  <option
                    key={evt.id}
                    value={evt.id}
                    className="bg-card text-foreground"
                  >
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              File Title *
            </label>
            <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Event Guidelines Document"
                className="flex-1 ml-2.5 bg-transparent text-foreground font-medium text-xs outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Upload File */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {isEditing ? "Replace File (Optional)" : "Upload File"} *
            </label>
            {filePreviewName ? (
              <div className="relative rounded-md border border-border bg-background p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {filePreviewName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
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
                  className="w-6 h-6 rounded-md bg-card text-muted-foreground hover:text-foreground border border-border flex items-center justify-center transition shrink-0 ml-2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="w-full h-24 rounded-md border border-dashed border-border bg-background/50 flex flex-col justify-center items-center gap-1.5 cursor-pointer hover:bg-secondary transition">
                <div className="w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-primary">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground block">
                    Click to browse file
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
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
        <div className="flex gap-3 px-5 py-4 border-t border-border bg-card shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-secondary hover:bg-secondary/80 border border-border py-2 rounded-md text-foreground font-semibold text-xs transition shadow-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 py-2 rounded-md text-primary-foreground font-semibold text-xs transition shadow-none flex items-center justify-center cursor-pointer"
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
