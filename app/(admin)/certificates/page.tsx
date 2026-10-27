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
      // Fallback open in new tab if cross-origin restricts direct blob download
      window.open(fileUrl, "_blank");
    }
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Event Certificates
          </h1>
          <p className="text-sm text-slate-400">
            Manage, view, and organize certificates added into the system.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedRecordForEdit(null);
            setIsModalVisible(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Add File</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <div className="relative w-full xl:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by certificate title or event name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-12 text-center text-slate-400">
          <span className="animate-pulse">Loading system files...</span>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
            <Award size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No files found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Get started by adding your first file into the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded-lg">
                    {cert.size_bytes
                      ? `${(cert.size_bytes / 1024).toFixed(1)} KB`
                      : "File"}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-white line-clamp-1">
                  {cert.file_name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">
                  Event:{" "}
                  <span className="text-slate-200">
                    {cert.event?.title || "Unknown Event"}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setViewerUrl(cert.file_url);
                    setViewerTitle(cert.file_name);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>View File</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(cert.file_url, cert.file_name)
                    }
                    title="Download File"
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecordForEdit(cert);
                      setIsModalVisible(true);
                    }}
                    title="Update File Info"
                    className="text-slate-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cert.id, cert.file_url)}
                    title="Delete File"
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dedicated In-Page Smart Viewer Modal */}
      <FileViewerModal
        visible={!!viewerUrl}
        fileUrl={viewerUrl}
        fileTitle={viewerTitle}
        onClose={() => setViewerUrl(null)}
        onDownload={handleDownload}
      />

      {/* Add / Update Form Modal */}
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
