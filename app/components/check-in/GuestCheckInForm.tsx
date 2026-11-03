// app/components/check-in/GuestCheckInForm.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  Check,
  Search,
} from "lucide-react";
import { EventStatusView } from "@/app/components/check-in/EventStatusView";
import GuestCheckInSkeleton from "@/app/components/check-in/GuestCheckInSkeleton";
import { nonBfarAttendanceService } from "@/services/nonBfarAttendanceService";
import { AttendanceScanType, NonBfarAttendee } from "@/types/attendance";

interface GuestCheckInFormProps {
  eventId: string;
}

export default function GuestCheckInForm({ eventId }: GuestCheckInFormProps) {
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<NonBfarAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusType, setStatusType] = useState<
    "invalid" | "upcoming" | "ended" | null
  >(null);

  // Scan Mode
  const [activeScanType, setActiveScanType] =
    useState<AttendanceScanType>("time_in");

  // Linked attendee state
  const [selectedAttendee, setSelectedAttendee] =
    useState<NonBfarAttendee | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const eventData = await nonBfarAttendanceService.getEventDetails(eventId);
      setEvent(eventData);

      const attendeesData = await nonBfarAttendanceService.getEventAttendances(
        eventData.id,
      );
      setAttendees(attendeesData);
    } catch (err) {
      console.error("Failed to load event data:", err);
      setStatusType("invalid");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadData();
  }, [eventId]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter attendees matching user input
  const matchingAttendees = attendees.filter((a) => {
    if (!fullName.trim()) return false;
    return a.full_name.toLowerCase().includes(fullName.trim().toLowerCase());
  });

  // When guest selects their name from live dropdown
  const handleSelectAttendee = (att: NonBfarAttendee) => {
    setSelectedAttendee(att);
    setFullName(att.full_name);
    setOrganization(att.organization);
    setEmail(att.email || "");
    setContactNumber(att.contact_number || "");
    setShowSuggestions(false);
  };

  const handleClearSelection = () => {
    setSelectedAttendee(null);
    setFullName("");
    setOrganization("");
    setEmail("");
    setContactNumber("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setSelectedAttendee(null);
    setFullName("");
    setOrganization("");
    setEmail("");
    setContactNumber("");
    setSelfieFile(null);
    setSelfiePreview(null);
    loadData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !organization.trim()) {
      alert("Please enter your Full Name and Organization.");
      return;
    }
    if (!event?.id) {
      alert("Event details not loaded.");
      return;
    }

    setSubmitting(true);
    try {
      await nonBfarAttendanceService.submitCheckIn({
        eventId: event.id,
        attendeeId: selectedAttendee?.id,
        fullName,
        organization,
        email,
        contactNumber,
        selfieFile,
        scanType: activeScanType,
      });

      setSuccess(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <GuestCheckInSkeleton />;

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

  const timelineType = event?.timeline_type || "in_out";
  const modes: { label: string; type: AttendanceScanType }[] =
    timelineType === "time_in_only"
      ? [{ label: "Time In", type: "time_in" }]
      : timelineType === "in_out"
        ? [
            { label: "Time In", type: "time_in" },
            { label: "Time Out", type: "time_out" },
          ]
        : [
            { label: "Time In", type: "time_in" },
            { label: "Break Out", type: "break_out" },
            { label: "Break In", type: "break_in" },
            { label: "Time Out", type: "time_out" },
          ];

  if (success) {
    const scanLabel = activeScanType.replace("_", " ").toUpperCase();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
        <div className="bg-card p-6 sm:p-8 rounded-md border border-border max-w-md w-full text-center space-y-4 shadow-none">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {scanLabel} Recorded!
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Thank you, <strong className="text-foreground">{fullName}</strong>
              . Your <strong className="text-foreground">{scanLabel}</strong>{" "}
              for <strong className="text-foreground">{event?.title}</strong>{" "}
              has been successfully logged.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
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
        {/* Header */}
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

        {/* Action Selection Tabs */}
        <div className="px-6 pt-5 pb-1 border-b border-border bg-secondary/20">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Select Check-In Action
          </label>
          <div className="flex flex-wrap gap-2 pb-4">
            {modes.map((m) => {
              const isActive = activeScanType === m.type;
              return (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => {
                    setActiveScanType(m.type);
                    setSelectedAttendee(null);
                  }}
                  className={`flex-1 min-w-[85px] py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:bg-secondary"
                  }`}
                >
                  <Clock size={13} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Linked Badge if matched to existing attendee */}
          {selectedAttendee && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-md flex items-center justify-between text-emerald-700 text-xs font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="truncate">
                  Linked to registered guest:{" "}
                  <strong>{selectedAttendee.full_name}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold underline ml-2 shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {/* Full Name with Live Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Full Name *
              </label>
              {activeScanType !== "time_in" && (
                <span className="text-[10px] text-muted-foreground">
                  Type to search existing check-in
                </span>
              )}
            </div>

            <div className="flex items-center bg-background border border-border rounded-md px-3 py-2">
              <User className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setShowSuggestions(true);
                  if (selectedAttendee) setSelectedAttendee(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type your name..."
                className="w-full bg-transparent text-foreground outline-none text-base sm:text-xs font-medium placeholder:text-muted-foreground/70"
              />
              {fullName.length > 0 && (
                <Search className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              )}
            </div>

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSuggestions && matchingAttendees.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-border/60">
                <div className="px-3 py-1.5 bg-secondary/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Matching Checked-In Guests
                </div>
                {matchingAttendees.map((att) => (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => handleSelectAttendee(att)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-secondary/70 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="truncate mr-2">
                      <span className="text-xs font-bold text-foreground block truncate group-hover:text-primary">
                        {att.full_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {att.organization}
                      </span>
                    </div>
                    <span className="text-[10px] bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground shrink-0 font-medium">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Organization */}
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

          {/* Email & Contact Number */}
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
              Verification Photo ({activeScanType.replace("_", " ")})
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
                      Ready for {activeScanType.replace("_", " ")}
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-md font-semibold text-sm transition shadow-none disabled:opacity-50 flex items-center justify-center cursor-pointer mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Recording {activeScanType.replace("_", " ")}...
              </>
            ) : (
              `Submit ${activeScanType.replace("_", " ").toUpperCase()}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
