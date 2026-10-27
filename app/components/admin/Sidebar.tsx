"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "@/types/user";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Flag,
  Award,
  Users,
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Event Attendance", href: "/event-attendance", icon: ClipboardCheck },
  { name: "Flag Attendance", href: "/flag-attendance", icon: Flag },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "Employees", href: "/employees", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            setUserProfile(data);
          } else {
            setUserProfile({
              id: user.id,
              code: "",
              fullname: user.user_metadata?.fullname || "Admin User",
              position: user.user_metadata?.position || "System Administrator",
              office: user.user_metadata?.office || "",
              role: "admin",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    }

    fetchUserProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-card text-foreground flex flex-col min-h-screen border-r border-border shrink-0 justify-between">
      {/* Top Section: Transparent Logo & Navigation */}
      <div>
        {/* Brand Header with Transparent Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src="/bfar.png"
              alt="BFAR Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-lg font-black text-foreground leading-tight">
                BFAR XI EPAS
              </h1>
              <p className="text-xs text-foreground">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-6 space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">
              Navigation
            </p>
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section: User Profile & Logout */}
      <div className="p-4 space-y-3 border-t border-border bg-background/50">
        <div className="flex items-center gap-3 py-2.5 px-3 bg-card rounded-md border">
          <img
            src="/bfar.png"
            alt="User Logo"
            className="w-9 h-9 rounded-lg object-contain shrink-0 bg-secondary p-1"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate leading-tight text-foreground">
              {userProfile?.fullname || "Loading..."}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {userProfile?.position || "Loading..."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-card hover:bg-red-200 border border-border rounded-md text-red-600 font-medium text-xs transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
