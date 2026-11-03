import React from "react";
import Sidebar from "@/app/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Fixed Sidebar */}
      <div className="h-screen sticky top-0 left-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="h-full max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
