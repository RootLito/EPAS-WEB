"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Camera,
  MapPin,
  CheckCircle2,
  User,
  Building,
  Mail,
  Phone,
} from "lucide-react";
import { EventStatusView } from "@/app/components/check-in/EventStatusView";

interface GuestCheckInFormProps {
  eventId: string;
}

export default function GuestCheckInForm({ eventId }: GuestCheckInFormProps) {
  const supabase = createClient();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusType, setStatusType] = useState<
    "invalid" | "upcoming" | "ended" | null
  >(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      // 1. Try querying by QR code identifier
      let { data, error } = await supabase
        .from("events")
        .select("*, venue:venues(*)")
        .eq("qr_code", eventId)
        .single();

      if (error) {
        // 2. Fallback: Try querying by primary key UUID
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("events")
          .select("*, venue:venues(*)")
          .eq("id", eventId)
          .single();

        if (fallbackError) {
          setStatusType("invalid");
          return;
        }
        data = fallbackData;
      }

      if (!data) {
        setStatusType("invalid");
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error("Error fetching event:", err);
      setStatusType("invalid");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !organization.trim()) {
      alert("Please enter your Full Name and Organization.");
      return;
    }

    if (!event || !event.id) {
      alert("Event details not loaded properly.");
      return;
    }

    setSubmitting(true);
    try {
      let selfieUrl = null;

      if (selfieFile) {
        const fileExt = selfieFile.name.split(".").pop() || "jpg";
        const fileName = `selfie_${Date.now()}.${fileExt}`;
        const filePath = `selfies/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-attachments")
          .upload(filePath, selfieFile, {
            contentType: selfieFile.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("event-attachments")
          .getPublicUrl(filePath);

        selfieUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("non_bfar_attendees")
        .insert([
          {
            event_id: event.id,
            full_name: fullName,
            organization: organization,
            email: email || null,
            contact_number: contactNumber || null,
            selfie_url: selfieUrl,
            checked_in_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Error checking in:", err);
      alert(err.message || "Failed to submit check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">
        Loading event details...
      </div>
    );
  }

  if (statusType) {
    return (
      <EventStatusView
        type={statusType}
        title={event?.title}
        startDate={event?.start_date}
        endDate={event?.end_date}
      />
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Check-In Successful!
          </h2>
          <p className="text-slate-600 mb-6">
            Thank you, <span className="font-semibold">{fullName}</span>. Your
            attendance for <span className="font-semibold">{event?.title}</span>{" "}
            has been successfully logged.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFullName("");
              setOrganization("");
              setEmail("");
              setContactNumber("");
              setSelfieFile(null);
              setSelfiePreview(null);
            }}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Info */}
        <div className="bg-slate-900 text-white p-6">
          <span className="text-xs uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-semibold">
            Guest Check-In Portal
          </span>
          <h1 className="text-2xl font-bold mt-3">{event?.title}</h1>
          {event?.venue?.address && (
            <div className="flex items-center gap-1.5 text-slate-300 text-sm mt-2">
              <MapPin size={16} />
              <span>{event.venue.address}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <User size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full bg-transparent text-slate-900 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Organization / Agency / LGU *
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <Building size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. LGU Malalag / Private Sector"
                className="w-full bg-transparent text-slate-900 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <Mail size={18} className="text-slate-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-slate-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Contact Number
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <Phone size={18} className="text-slate-400 mr-2" />
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="09123456789"
                  className="w-full bg-transparent text-slate-900 outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Selfie Upload / Camera capture */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Verification Selfie
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50">
              {selfiePreview ? (
                <div className="relative inline-block">
                  <img
                    src={selfiePreview}
                    alt="Selfie Preview"
                    className="w-32 h-32 object-cover rounded-xl mx-auto mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelfieFile(null);
                      setSelfiePreview(null);
                    }}
                    className="text-xs text-red-500 font-semibold underline"
                  >
                    Remove / Retake
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-4">
                  <Camera size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">
                    Take or Upload Selfie
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Click to open camera or browse gallery
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-slate-800 transition disabled:opacity-50 mt-2"
          >
            {submitting ? "Submitting Check-In..." : "Check In Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
