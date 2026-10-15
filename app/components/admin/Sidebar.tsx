"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Flag,
  Award,
  Users,
  ChevronsUpDown,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Event Attendance", href: "/event-attendance", icon: ClipboardCheck },
  { name: "Flag Attendance", href: "/flag-attendance", icon: Flag },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "Employees", href: "/employees", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col min-h-screen border-r border-slate-800">
      {/* Workspace / App Header */}
      <div className="p-4">
        <div className="flex items-center justify-between text-white py-2">
          <div className="flex items-center gap-4">
            <img
              src="/bfar.png"
              alt="BFAR Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold leading-tight">
                BFAR XI EPAS
              </h1>
              <p className="text-sm text-slate-400">Admin Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white font-semibold border border-slate-800"
                      : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer with Base UI Dropdown Trigger */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center justify-between w-full py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-200 transition cursor-pointer text-left" />
            }
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                AS
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium truncate leading-tight">
                  Admin User
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  angelitosentillas...
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-900 border-slate-800 text-slate-200"
          >
            <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer text-red-400">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
