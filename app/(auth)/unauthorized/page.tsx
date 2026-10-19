"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, ArrowLeft, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const { user, role, logout } = useAuth();

  const getDashboardPath = () => {
    if (role === "student") return "/student/dashboard";
    if (role === "faculty") return "/faculty/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/login";
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-card py-10 px-6 shadow-xl border border-surface-200 rounded-2xl text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-status-dangerBg text-status-danger mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h1 className="text-xl font-bold text-white">
            Access Restricted
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            You do not have the required permissions to access this academic route.
            CampusOne enforces strict role-based access control and isolation.
          </p>

          <div className="mt-4 p-3 rounded-lg bg-surface-100 text-xs text-slate-300 text-left border border-surface-200">
            <div className="flex justify-between py-1 border-b border-surface-200/70">
              <span className="text-slate-400">Current User:</span>
              <span className="font-semibold text-white">{user?.full_name || "Unauthenticated"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Authorized Role:</span>
              <span className="font-semibold capitalize text-brand-blue">{role || "None"}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href={getDashboardPath()}>
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-1.5" />
                Go to My Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
