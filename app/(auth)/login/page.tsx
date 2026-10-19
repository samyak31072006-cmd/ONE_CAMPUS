"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, Shield, UserCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/database";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("arjun.mehta@student.campusone.edu");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please provide a valid college email address");
      return;
    }
    const success = await login(email, selectedRole);
    if (!success) {
      setError("Invalid academic credentials or inactive user account");
    }
  };

  const handleDemoSelect = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setSelectedRole(demoRole);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-blue text-slate-950 shadow-lg mb-4">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Sign in to CampusOne
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Integrated College Academic & Attendance Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-card py-8 px-6 shadow-xl border border-surface-200 rounded-2xl sm:px-10">
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-surface-100 rounded-lg mb-6 border border-surface-200/70">
            <button
              type="button"
              onClick={() => handleDemoSelect("arjun.mehta@student.campusone.edu", "student")}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedRole === "student"
                  ? "bg-surface-200 text-brand-blue border border-brand-blue/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect("prof.sharma@campusone.edu", "faculty")}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedRole === "faculty"
                  ? "bg-surface-200 text-brand-blue border border-brand-blue/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Faculty
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect("admin@campusone.edu", "admin")}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedRole === "admin"
                  ? "bg-surface-200 text-brand-blue border border-brand-blue/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-md bg-status-dangerBg text-status-dangerText border border-status-danger/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                College Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="id@campusone.edu"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-blue hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="md"
              isLoading={isLoading}
            >
              Sign In to {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-5 border-t border-surface-200/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Verified Test Accounts (Click to auto-fill):
            </p>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleDemoSelect("arjun.mehta@student.campusone.edu", "student")}
                className="w-full text-left p-2.5 rounded-lg hover:bg-surface-100 border border-surface-200/40 hover:border-surface-200 flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-medium text-slate-200">Arjun Mehta</span>
                  <span className="text-slate-400 text-[11px] block">arjun.mehta@student.campusone.edu</span>
                </div>
                <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-medium">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect("prof.sharma@campusone.edu", "faculty")}
                className="w-full text-left p-2.5 rounded-lg hover:bg-surface-100 border border-surface-200/40 hover:border-surface-200 flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-medium text-slate-200">Prof. Rajesh Sharma</span>
                  <span className="text-slate-400 text-[11px] block">prof.sharma@campusone.edu</span>
                </div>
                <span className="text-[10px] bg-sky-950/60 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-medium">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect("admin@campusone.edu", "admin")}
                className="w-full text-left p-2.5 rounded-lg hover:bg-surface-100 border border-surface-200/40 hover:border-surface-200 flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-medium text-slate-200">Dr. Eleanor Vance</span>
                  <span className="text-slate-400 text-[11px] block">admin@campusone.edu</span>
                </div>
                <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
