"use client";

import { EventCard } from "@/app/components/admin/EventCard";
import { EventDetailModal } from "@/app/components/admin/EventDetailModal";
import { EventFormModal } from "@/app/components/admin/EventFormModal";
import { QRCodeModal } from "@/app/components/admin/QRCodeModal";
import { deleteEvent, getEvents } from "@/services/eventService";
import { Event } from "@/types";
import { Loader2, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const FILTER_TABS = ["All", "Upcoming", "Ongoing", "Completed"];

export default function EventIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Full-screen Image State
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // QR Code Modal State
  const [selectedQrEvent, setSelectedQrEvent] = useState<Event | null>(null);

  // Detail View Modal State
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<Event | null>(
    null,
  );

  // Form Modal State (Create / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error: any) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesTab =
      selectedTab === "All" ||
      event.status?.toLowerCase() === selectedTab.toLowerCase();

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.address?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  const handleDeleteEvent = async (event: Event) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteEvent(event.id);
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
      } catch (error: any) {
        console.error("Failed to delete event:", error);
        alert(error?.message || "Failed to delete event.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Events Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, monitor, and manage BFAR XI's scheduled events
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold transition shadow-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center w-full xl:max-w-sm bg-card border border-border px-4 py-2.5 rounded-md text-foreground">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title or venue..."
            className="flex-1 ml-3 bg-transparent text-sm text-foreground font-medium outline-none placeholder:text-muted-foreground/70"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTER_TABS.map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-none"
                    : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event List Grid */}
      {loading ? (
        <div className="p-12 bg-card border border-border rounded-md flex items-center justify-center shadow-none">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={(e) => setSelectedDetailEvent(e)}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onImagePress={(url) => setSelectedImageUrl(url)}
              onQrPress={(e) => setSelectedQrEvent(e)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 bg-card border border-border border-dashed rounded-md flex items-center justify-center text-center shadow-none">
          <p className="text-sm font-medium text-muted-foreground">
            No events found.
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      <EventFormModal
        visible={isFormModalOpen}
        eventToEdit={editingEvent}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchEvents}
      />

      {/* Full Event Details Modal */}
      <EventDetailModal
        visible={!!selectedDetailEvent}
        event={selectedDetailEvent}
        onClose={() => setSelectedDetailEvent(null)}
        onImagePress={(url) => setSelectedImageUrl(url)}
        onQrPress={(e) => setSelectedQrEvent(e)}
      />

      {/* Dedicated QR Code Modal */}
      <QRCodeModal
        visible={!!selectedQrEvent}
        qrCode={selectedQrEvent?.qr_code || ""}
        qrImageUrl={selectedQrEvent?.qr_image_url}
        eventTitle={selectedQrEvent?.title}
        onClose={() => setSelectedQrEvent(null)}
      />

      {/* Full Screen Image Modal */}
      {selectedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-5">
          <button
            type="button"
            onClick={() => setSelectedImageUrl(null)}
            className="absolute top-6 right-6 z-50 w-10 h-10 rounded-md bg-card border border-border text-foreground flex items-center justify-center hover:bg-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedImageUrl}
            alt="Fullscreen preview"
            className="max-w-full max-h-[85vh] object-contain rounded-md"
          />
        </div>
      )}
    </div>
  );
}
