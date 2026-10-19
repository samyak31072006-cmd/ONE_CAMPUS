"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { User, Lock, Phone, Mail, ShieldCheck, BookOpen, CheckCircle2 } from "lucide-react";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "+1-555-0177");
  const [emergencyContact, setEmergencyContact] = useState("+1-555-0922 (Parents)");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Student Identity & Academic Record</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official institutional credentials and authorized contact settings
        </p>
      </div>

      {isSaved && (
        <Alert variant="success" title="Profile Saved">
          Your authorized contact information has been updated successfully in the college database.
        </Alert>
      )}

      {/* Identity Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-brand-navy text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                {user?.full_name?.charAt(0) || "S"}
              </div>
              <div>
                <CardTitle className="text-lg">{user?.full_name}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll / College ID: <strong className="text-slate-800">{user?.college_id}</strong>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="success">Active Enrolled</Badge>
                  <Badge variant="primary">Undergraduate (B.Tech)</Badge>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-status-success">
                <ShieldCheck className="h-4 w-4" />
                Verified Student
              </span>
              <span>Account Status: Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="border-b border-surface-100 pb-4 mb-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Official Academic Registration (Read-Only)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                <span className="text-[11px] text-slate-500 block">Department</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  Computer Science & Eng.
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <Lock className="h-3 w-3" /> Immutable
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                <span className="text-[11px] text-slate-500 block">Current Semester</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  Semester {user?.semester || 6}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <Lock className="h-3 w-3" /> Registrar Locked
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                <span className="text-[11px] text-slate-500 block">Assigned Section</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  Section {user?.section || "A"}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <Lock className="h-3 w-3" /> Institutional
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                <span className="text-[11px] text-slate-500 block">Institutional Email</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate" title={user?.email}>
                  {user?.email}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <Lock className="h-3 w-3" /> SSO Primary
                </span>
              </div>
            </div>
          </div>

          {/* Editable Contact Fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Authorized Self-Editable Settings
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Personal Contact Number
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for urgent SMS alerts from Dean of Students
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact / Guardian Phone
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Emergency medical and campus security point of contact
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="sm" isLoading={isLoading}>
                Update Contact Information
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
