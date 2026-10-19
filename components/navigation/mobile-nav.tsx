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
  ShieldCheck,
  Settings,
  History,
  Network,
  LogOut,
  X,
} from "lucide-react";

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { role, logout, user } = useAuth();

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-surface-card border-r border-surface-200 text-white flex flex-col shadow-2xl animate-in slide-in-from-left">
        <div className="flex items-center justify-between p-4 border-b border-surface-200/70">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-slate-950 font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">CampusOne</h2>
              <p className="text-[10px] text-brand-blue uppercase">{role} portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-surface-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-blue/15 text-brand-blue border border-brand-blue/30 font-semibold"
                    : "text-slate-300 hover:bg-surface-100 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-brand-blue" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-200/70 bg-surface-50/50">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-surface-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
