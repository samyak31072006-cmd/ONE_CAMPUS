"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  CalendarCheck,
  FileSpreadsheet,
  FileQuestion,
  Calendar,
  User,
  Bell,
  Users,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Settings,
  History,
  Network,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { role, logout, user } = useAuth();

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/student/assessments", label: "Assessments", icon: FileSpreadsheet },
    { href: "/student/exemptions", label: "Exemptions", icon: FileQuestion },
    { href: "/student/timetable", label: "Timetable", icon: Calendar },
    { href: "/student/profile", label: "My Profile", icon: User },
    { href: "/student/notifications", label: "Notifications", icon: Bell },
  ];

  const facultyLinks = [
    { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/faculty/classes", label: "Assigned Classes", icon: BookOpen },
    { href: "/faculty/attendance", label: "Mark Attendance", icon: CalendarCheck },
    { href: "/faculty/assessments", label: "Assessments & Marks", icon: FileSpreadsheet },
    { href: "/faculty/exemptions", label: "Exemption Queue", icon: FileQuestion },
    { href: "/faculty/timetable", label: "Teaching Schedule", icon: Calendar },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Directory", icon: Users },
    { href: "/admin/academics", label: "Academics Management", icon: BookOpen },
    { href: "/admin/timetable", label: "Timetable Master", icon: Calendar },
    { href: "/admin/exemptions", label: "Exemption Oversight", icon: ShieldCheck },
    { href: "/admin/integrations", label: "Portal Integrations", icon: Network },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  let links = studentLinks;
  if (role === "faculty") links = facultyLinks;
  if (role === "admin") links = adminLinks;

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#070D18] text-white min-h-screen shrink-0 border-r border-surface-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-200/70">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-slate-950 font-bold shadow-md">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">CampusOne</h1>
          <p className="text-[10px] text-brand-blue uppercase tracking-widest font-semibold">
            {role ? `${role.toUpperCase()} PORTAL` : "ACADEMIC PORTAL"}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-brand-blue/15 text-brand-blue border border-brand-blue/30 shadow-sm font-semibold"
                  : "text-slate-300 hover:bg-surface-100/70 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-105 shrink-0",
                  isActive ? "text-brand-blue" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-surface-200/70 bg-surface-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || "Academic User"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.college_id || "ID: Pending"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-surface-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
