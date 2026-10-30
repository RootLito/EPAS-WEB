"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Award,
  ExternalLink,
  Trash2,
  FileText,
  Download,
  Edit3,
  Loader2,
} from "lucide-react";
import {
  getCertificates,
  deleteCertificate,
} from "@/services/certificateService";
import { Certificate } from "@/types/certificate";
import { CertificateFormModal } from "@/app/components/admin/CertificateFormModal";
import { FileViewerModal } from "@/app/components/admin/FileViewerModal";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<any>(null);

  // Viewer Modal State
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>("");

  const fetchCertificatesData = async () => {
    setLoading(true);
    try {
      const data = await getCertificates();
      setCertificates(data);
    } catch (err) {
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificatesData();
  }, []);

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this file from the system?"))
      return;
    try {
      await deleteCertificate(id, fileUrl);
      setCertificates((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete file.");
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(fileUrl, "_blank");
    }
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* 1. Header (matches EventIndex Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Event Certificates
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage, view, and organize certificates added into the system
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedRecordForEdit(null);
            setIsModalVisible(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold transition shadow-none self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add File</span>
        </button>
      </div>

      {/* 2. Toolbar (matches EventIndex Search Bar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center w-full xl:max-w-sm bg-card border border-border px-4 py-2.5 rounded-md text-foreground shadow-none">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by certificate or event name..."
            className="flex-1 ml-3 bg-transparent text-sm text-foreground font-medium outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* 3. Certificate Cards Grid */}
      {loading ? (
        <div className="p-12 bg-card border border-border rounded-md flex items-center justify-center shadow-none">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="p-12 bg-card border border-border border-dashed rounded-md flex flex-col items-center justify-center text-center shadow-none">
          <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No files found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Get started by adding your first certificate into the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-card border border-border rounded-md p-4 flex flex-col justify-between gap-4 hover:border-border/80 transition shadow-none"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded-md">
                    {cert.size_bytes
                      ? `${(cert.size_bytes / 1024).toFixed(1)} KB`
                      : "File"}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-1">
                  {cert.file_name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Event:{" "}
                  <span className="text-foreground font-medium">
                    {cert.event?.title || "Unknown Event"}
                  </span>
                </p>
              </div>

              {/* Action Buttons (matches EventCard button group) */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setViewerUrl(cert.file_url);
                    setViewerTitle(cert.file_name);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>View File</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(cert.file_url, cert.file_name)
                    }
                    title="Download File"
                    className="w-6 h-6 rounded-md bg-secondary border border-border hover:bg-secondary/80 flex items-center justify-center transition text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Download size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecordForEdit(cert);
                      setIsModalVisible(true);
                    }}
                    title="Update File Info"
                    className="w-6 h-6 rounded-md bg-secondary border border-border hover:bg-secondary/80 flex items-center justify-center transition text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cert.id, cert.file_url)}
                    title="Delete File"
                    className="w-6 h-6 rounded-md bg-secondary border border-border hover:bg-rose-500/10 flex items-center justify-center transition text-rose-500 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Viewer Modal */}
      <FileViewerModal
        visible={!!viewerUrl}
        fileUrl={viewerUrl}
        fileTitle={viewerTitle}
        onClose={() => setViewerUrl(null)}
        onDownload={handleDownload}
      />

      {/* Form Modal */}
      <CertificateFormModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedRecordForEdit(null);
        }}
        onSuccess={fetchCertificatesData}
        initialData={selectedRecordForEdit}
      />
    </div>
  );
}
