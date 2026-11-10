import React from "react";
import Sidebar from "@/app/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      {/* Sidebar: Fixed and sticky on desktop */}
      <div className="lg:h-screen lg:sticky lg:top-0 lg:left-0 z-40">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="h-full max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}