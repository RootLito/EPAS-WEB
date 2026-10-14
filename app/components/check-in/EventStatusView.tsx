import { AlertCircle, CalendarClock, Ban } from "lucide-react";

interface EventStatusViewProps {
  type: "invalid" | "upcoming" | "ended";
  title?: string;
  startDate?: string;
  endDate?: string;
}

export function EventStatusView({
  type,
  title,
  startDate,
  endDate,
}: EventStatusViewProps) {
  const configs = {
    invalid: {
      icon: <Ban size={48} className="text-red-500 mx-auto mb-4" />,
      heading: "Invalid Event Code",
      description:
        "The event link or QR code you scanned does not exist in our database. Please check with the event coordinator.",
      bg: "border-red-100 bg-red-50/50",
    },
    upcoming: {
      icon: <CalendarClock size={48} className="text-amber-500 mx-auto mb-4" />,
      heading: "Event Has Not Started Yet",
      description: `"${title || "This event"}" is scheduled to start on ${startDate ? new Date(startDate).toLocaleString() : "a later date"}. Check-in will open when the event begins.`,
      bg: "border-amber-100 bg-amber-50/50",
    },
    ended: {
      icon: <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />,
      heading: "Event Has Ended",
      description: `"${title || "This event"}" concluded on ${endDate ? new Date(endDate).toLocaleString() : "a previous date"}. Check-in is now closed.`,
      bg: "border-slate-200 bg-slate-50",
    },
  };

  const current = configs[type];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div
        className={`p-8 rounded-2xl shadow-sm border max-w-md w-full text-center bg-white ${current.bg}`}
      >
        {current.icon}
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {current.heading}
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          {current.description}
        </p>
      </div>
    </div>
  );
}
