"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  mockCourseOfferings,
  mockClassSessions,
  mockAssessments,
  mockExemptionRequests,
  mockTimetableEntries,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime, formatDate } from "@/lib/utils";
import {
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  FileQuestion,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function FacultyDashboardPage() {
  const { user } = useAuth();

  // Assigned course offerings for this faculty (e.g. Prof. Rajesh Sharma: CS301, CS302, CS303)
  const assignedOfferings = useMemo(() => {
    return mockCourseOfferings.filter((o) => o.faculty_id === user?.id || user?.role === "admin");
  }, [user?.id, user?.role]);

  const assignedOfferingIds = useMemo(() => {
    return new Set(assignedOfferings.map((o) => o.id));
  }, [assignedOfferings]);

  // Today's classes
  const todayClasses = useMemo(() => {
    return mockTimetableEntries.filter(
      (t) => assignedOfferingIds.has(t.course_offering_id) && t.day_of_week === "monday"
    );
  }, [assignedOfferingIds]);

  // Pending exemption reviews for classes taught by this faculty
  const pendingExemptions = useMemo(() => {
    return mockExemptionRequests.filter((req) => {
      const session = mockClassSessions.find((s) => s.id === req.class_session_id);
      return (
        session &&
        assignedOfferingIds.has(session.course_offering_id) &&
        (req.status === "pending" || req.status === "under_review")
      );
    });
  }, [assignedOfferingIds]);

  // Unpublished (draft) assessments
  const draftAssessments = useMemo(() => {
    return mockAssessments.filter(
      (a) => assignedOfferingIds.has(a.course_offering_id) && !a.is_published
    );
  }, [assignedOfferingIds]);

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-card p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">
            Faculty Academic Portal • Fall 2026
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">
            Welcome, {user?.full_name || "Professor"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Department of Computer Science & Engineering • Faculty ID: <strong className="text-slate-200">{user?.college_id}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/faculty/attendance">
            <Button variant="primary" size="sm">
              <CalendarCheck className="h-4 w-4 mr-1.5" />
              Mark Attendance
            </Button>
          </Link>
          <Link href="/faculty/assessments">
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              Grade Assessments
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/faculty/classes" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assigned Classes
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-brand-navy">
                {assignedOfferings.length}
              </div>
              <p className="mt-1 text-xs text-slate-500">Active Course Offerings</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>View Class Rosters</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/faculty/exemptions" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Exemptions
                </span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <FileQuestion className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-brand-navy">
                {pendingExemptions.length}
              </div>
              <p className="mt-1 text-xs text-slate-500">Student requests requiring review</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>Open Review Queue</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/faculty/assessments" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Draft Assessments
                </span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-brand-navy">
                {draftAssessments.length}
              </div>
              <p className="mt-1 text-xs text-slate-500">Unpublished score sheets</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>Review & Publish Marks</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/faculty/timetable" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Today&apos;s Lectures
                </span>
                <div className="p-2 rounded-lg bg-green-50 text-status-success">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-brand-navy">
                {todayClasses.length}
              </div>
              <p className="mt-1 text-xs text-slate-500">Teaching hours scheduled</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>View Full Schedule</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Assigned Classes & Exemption Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Classes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assigned Courses & Offerings</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorized course allocations for active semester
                </p>
              </div>
              <Link href="/faculty/classes">
                <Button variant="ghost" size="sm" className="text-xs text-brand-blue">
                  All Classes <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedOfferings.map((offering) => (
                <div
                  key={offering.id}
                  className="p-4 rounded-lg border border-surface-200 bg-surface-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{offering.course?.code}</Badge>
                      <h4 className="text-xs font-bold text-slate-900">
                        {offering.course?.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Section {offering.section} • Capacity: {offering.capacity} Students • Term: {offering.academic_term?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/faculty/attendance?offeringId=${offering.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        Attendance
                      </Button>
                    </Link>
                    <Link href={`/faculty/assessments?offeringId=${offering.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        Marks
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Exemption Review Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Exemption Reviews</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Action required: verify student documentation and make attendance decisions
                </p>
              </div>
              <Link href="/faculty/exemptions">
                <Button variant="ghost" size="sm" className="text-xs text-brand-blue">
                  Review Queue
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingExemptions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  All student absence exemption requests have been reviewed.
                </p>
              ) : (
                <div className="divide-y divide-surface-100">
                  {pendingExemptions.map((req) => (
                    <div key={req.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-navy">
                            {req.student?.full_name} ({req.student?.college_id})
                          </span>
                          <Badge variant="warning">Pending Review</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-1">
                          Reason: {req.reason}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Submitted {formatDate(req.submitted_at)}
                        </span>
                      </div>
                      <Link href="/faculty/exemptions">
                        <Button variant="primary" size="sm" className="text-xs h-8">
                          Review
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Teaching Agenda */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Teaching Agenda</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Monday Lecture Slots</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayClasses.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No lectures scheduled for today.
                </p>
              ) : (
                todayClasses.map((item) => {
                  const offering = assignedOfferings.find((o) => o.id === item.course_offering_id);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-surface-200 bg-surface-50 flex items-start gap-3"
                    >
                      <div className="p-2 rounded bg-white border border-surface-200 text-brand-blue">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {offering?.course?.code}: {offering?.course?.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {formatTime(item.start_time)} – {formatTime(item.end_time)}
                        </span>
                        <span className="text-[11px] font-semibold text-brand-blue block mt-0.5">
                          Room: {item.room} (Sec {offering?.section})
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
