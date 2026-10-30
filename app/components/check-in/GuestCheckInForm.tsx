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
  Loader2,
  X,
} from "lucide-react";
import { EventStatusView } from "@/app/components/check-in/EventStatusView";
import GuestCheckInSkeleton from "@/app/components/check-in/GuestCheckInSkeleton";

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

      let { data, error } = await supabase
        .from("events")
        .select("*, venue:venues(*)")
        .eq("qr_code", eventId)
        .single();

      if (error) {
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

  // Uses the dedicated shimmering skeleton (zero "Loading..." text)
  if (loading) {
    return <GuestCheckInSkeleton />;
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
        <div className="bg-card p-6 sm:p-8 rounded-md border border-border max-w-md w-full text-center space-y-4 shadow-none">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Check-In Successful!
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Thank you, <strong className="text-foreground">{fullName}</strong>
              . Your attendance for{" "}
              <strong className="text-foreground">{event?.title}</strong> has
              been recorded.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setFullName("");
              setOrganization("");
              setEmail("");
              setContactNumber("");
              setSelfieFile(null);
              setSelfiePreview(null);
            }}
            className="w-full bg-secondary hover:bg-secondary/80 border border-border text-foreground py-2.5 rounded-md font-semibold text-xs transition cursor-pointer mt-2"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full bg-card rounded-md border border-border overflow-hidden shadow-none">
        {/* Colored Header Banner */}
        <div className="p-6 bg-primary text-white space-y-2.5">
          <span className="inline-block text-[10px] uppercase tracking-wider bg-white/15 text-white border border-white/20 px-2.5 py-0.5 rounded-md font-bold">
            Guest Check-In Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {event?.title}
          </h1>
          {event?.venue?.address && (
            <div className="flex items-center gap-1.5 text-blue-100/90 text-xs font-medium pt-0.5">
              <MapPin size={14} className="shrink-0 text-blue-300" />
              <span>{event.venue.address}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Full Name *
            </label>
            <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
              <User className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full bg-transparent text-foreground outline-none text-base sm:text-xs font-medium placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Organization / Agency / LGU *
            </label>
            <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
              <Building className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. LGU Malalag / Private Sector"
                className="w-full bg-transparent text-foreground outline-none text-base sm:text-xs font-medium placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                <Mail className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-foreground outline-none text-base sm:text-xs font-medium placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Contact Number
              </label>
              <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
                <Phone className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="09123456789"
                  className="w-full bg-transparent text-foreground outline-none text-base sm:text-xs font-medium placeholder:text-muted-foreground/70"
                />
              </div>
            </div>
          </div>

          {/* Verification Photo */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Verification Photo (Optional)
            </label>
            {selfiePreview ? (
              <div className="relative rounded-md border border-border bg-background p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={selfiePreview}
                    alt="Selfie Preview"
                    className="w-12 h-12 rounded-md object-cover border border-border shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      Photo Captured
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Ready to submit with check-in
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelfieFile(null);
                    setSelfiePreview(null);
                  }}
                  className="w-6 h-6 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="w-full h-24 rounded-md border border-dashed border-border bg-background/50 flex flex-col justify-center items-center gap-1.5 cursor-pointer hover:bg-secondary transition">
                <div className="w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-primary">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground block">
                    Take or Upload Photo
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Click to open camera or browse files
                  </span>
                </div>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm transition shadow-none disabled:opacity-50 flex items-center justify-center cursor-pointer mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting Check-In...
              </>
            ) : (
              "Check In Now"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
