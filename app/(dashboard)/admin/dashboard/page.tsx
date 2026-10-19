"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  mockProfiles,
  mockCourses,
  mockCourseOfferings,
  mockSyncRuns,
  mockAuditLogs,
  mockExemptionRequests,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Network,
  History,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const studentsCount = useMemo(() => mockProfiles.filter((p) => p.role === "student").length, []);
  const facultyCount = useMemo(() => mockProfiles.filter((p) => p.role === "faculty").length, []);
  const coursesCount = useMemo(() => mockCourses.length, []);
  const offeringsCount = useMemo(() => mockCourseOfferings.length, []);

  const latestSync = mockSyncRuns[0];
  const recentLogs = useMemo(() => mockAuditLogs.slice(0, 4), []);
  const pendingExemptionsCount = useMemo(
    () => mockExemptionRequests.filter((e) => e.status === "pending" || e.status === "under_review").length,
    []
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-card p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Administrative Console • Institutional Governance
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            CampusOne Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{user?.full_name}</strong> (Chief Administrator)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/integrations">
            <Button variant="outline" size="sm">
              <Network className="h-4 w-4 mr-1.5 text-brand-blue" />
              Sync Status
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="primary" size="sm">
              <Users className="h-4 w-4 mr-1.5" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Campus Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/users" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Students
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-brand-navy">
                {studentsCount}
              </div>
              <p className="mt-1 text-xs text-slate-500">Active enrollments across terms</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>Manage User Directory</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Faculty Members
                </span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-brand-navy">
                {facultyCount}
              </div>
              <p className="mt-1 text-xs text-slate-500">Departmental instructors</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>View Faculty Roles</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/academics" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Course Offerings
                </span>
                <div className="p-2 rounded-lg bg-green-50 text-status-success">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-brand-navy">
                {offeringsCount}
              </div>
              <p className="mt-1 text-xs text-slate-500">{coursesCount} Master catalog courses</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>Configure Offerings</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/integrations" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  SIS / ERP Sync Health
                </span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Network className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl font-bold text-brand-navy">
                  {latestSync?.status === "completed" ? "Operational" : "Partial Sync"}
                </span>
                <Badge variant={latestSync?.status === "completed" ? "success" : "warning"}>
                  {latestSync?.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">Last run: {formatDate(latestSync?.started_at || "")}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>Inspect Integration</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Admin Section: Audit Trail & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): System Audit Trail Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Privileged Academic Audit Trail</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Append-only immutable record of sensitive marks, attendance, and role actions
                </p>
              </div>
              <Link href="/admin/audit-logs">
                <Button variant="ghost" size="sm" className="text-xs text-brand-blue">
                  All Logs <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-surface-100">
                {recentLogs.map((log) => (
                  <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" className="text-[10px]">
                          {log.action}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-800">
                          {log.actor?.full_name || "Academic System"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono text-[11px]">
                        Target: {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)}...)` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">
                        {formatDate(log.created_at)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        IP: {log.ip_address}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Governance Quick Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Governance Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-brand-navy" />
                  <span className="text-xs font-semibold text-slate-800">Role Provisioning</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/academics"
                className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-brand-navy" />
                  <span className="text-xs font-semibold text-slate-800">Terms & Course Catalog</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/timetable"
                className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-brand-navy" />
                  <span className="text-xs font-semibold text-slate-800">Timetable Conflict Engine</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/exemptions"
                className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-brand-navy" />
                  <span className="text-xs font-semibold text-slate-800">
                    College Exemption Oversight ({pendingExemptionsCount})
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/integrations"
                className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Network className="h-4 w-4 text-brand-navy" />
                  <span className="text-xs font-semibold text-slate-800">ERP Sync Adapter Status</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
