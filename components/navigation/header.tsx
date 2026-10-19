"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Bell, Menu, Shield, UserCheck, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mockNotifications } from "@/lib/mock-data";

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const { user, role, quickSwitchUser, allProfiles } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Unread notifications count for current user
  const unreadCount = mockNotifications.filter(
    (n) => n.user_id === user?.id && !n.is_read
  ).length;

  return (
    <header className="h-16 bg-surface-card/90 backdrop-blur border-b border-surface-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-surface-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            CampusOne
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-100 capitalize">
            {role || "Dashboard"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Dev Switcher for seamless pair programming & test inspection */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border border-brand-blue/30 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors"
            title="Switch test persona for role testing"
          >
            {role === "student" && <GraduationCap className="h-3.5 w-3.5 text-brand-blue" />}
            {role === "faculty" && <UserCheck className="h-3.5 w-3.5 text-brand-blue" />}
            {role === "admin" && <Shield className="h-3.5 w-3.5 text-amber-400" />}
            <span className="hidden sm:inline text-slate-300">Role:</span>
            <span className="font-bold capitalize">{role}</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface-card p-2 shadow-2xl border border-surface-200 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-surface-200/70 mb-1">
                Test Role Switcher
              </div>
              {allProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    quickSwitchUser(p.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    p.id === user?.id
                      ? "bg-brand-blue/20 text-brand-blue font-bold border border-brand-blue/30"
                      : "hover:bg-surface-100 text-slate-300"
                  }`}
                >
                  <div className="truncate">
                    <p className="font-medium truncate text-slate-100">{p.full_name}</p>
                    <p className="text-[10px] text-slate-400">{p.email}</p>
                  </div>
                  <Badge
                    variant={
                      p.role === "admin"
                        ? "warning"
                        : p.role === "faculty"
                        ? "info"
                        : "success"
                    }
                  >
                    {p.role}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Link */}
        <Link
          href={role === "student" ? "/student/notifications" : "#"}
          className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-100 rounded-full transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Identity Avatar */}
        <div className="flex items-center gap-2 border-l border-surface-200 pl-3 sm:pl-4">
          <div className="h-8 w-8 rounded-full bg-brand-blue text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-100 leading-none">
              {user?.full_name}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-1">
              {user?.college_id}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
