"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  mockCourseOfferings,
  mockClassSessions,
  mockAttendanceRecords,
  mockAssessments,
  mockAssessmentScores,
  mockExemptionRequests,
  mockTimetableEntries,
  mockNotifications,
} from "@/lib/mock-data";
import { calculateAttendance } from "@/lib/attendance/calculator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CircularAttendance } from "@/components/attendance/circular-attendance";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatTime, formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  FileSpreadsheet,
  FileQuestion,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  // Student's enrolled course offerings (CS301, CS302, CS303)
  const studentOfferings = useMemo(() => {
    return mockCourseOfferings.slice(0, 3);
  }, []);

  // Calculate deterministic attendance metrics
  const attendanceSummary = useMemo(() => {
    const studentRecords = mockAttendanceRecords.filter(
      (r) => r.student_id === user?.id
    );
    const approvedExemptions = mockExemptionRequests.filter(
      (e) => e.student_id === user?.id && e.status === "approved"
    );

    return calculateAttendance({
      offerings: studentOfferings,
      sessions: mockClassSessions,
      attendanceRecords: studentRecords,
      approvedExemptions,
      referenceDate: "2026-10-19",
    });
  }, [user?.id, studentOfferings]);

  // Student's published assessment scores only (No peer data!)
  const publishedAssessments = useMemo(() => {
    const publishedIds = new Set(
      mockAssessments.filter((a) => a.is_published).map((a) => a.id)
    );
    const myScores = mockAssessmentScores.filter(
      (s) => s.student_id === user?.id && publishedIds.has(s.assessment_id)
    );

    return myScores.map((score) => {
      const assessment = mockAssessments.find((a) => a.id === score.assessment_id);
      const offering = studentOfferings.find((o) => o.id === assessment?.course_offering_id);
      return {
        id: score.id,
        assessmentTitle: assessment?.title || "Assessment",
        courseCode: offering?.course?.code || "CS",
        marksObtained: score.marks_obtained,
        maxMarks: assessment?.max_marks || 100,
        percentage: Math.round((score.marks_obtained / (assessment?.max_marks || 100)) * 100),
        remarks: score.remarks,
      };
    });
  }, [user?.id, studentOfferings]);

  const assessmentAverage = useMemo(() => {
    if (publishedAssessments.length === 0) return 0;
    const totalPct = publishedAssessments.reduce((acc, a) => acc + a.percentage, 0);
    return Math.round(totalPct / publishedAssessments.length);
  }, [publishedAssessments]);

  // Pending exemption requests
  const pendingExemptions = useMemo(() => {
    return mockExemptionRequests.filter(
      (e) => e.student_id === user?.id && (e.status === "pending" || e.status === "under_review")
    );
  }, [user?.id]);

  // Today's & Upcoming classes (Monday schedule for Oct 19, 2026)
  const upcomingClasses = useMemo(() => {
    return mockTimetableEntries.filter(
      (t) => t.day_of_week === "monday" || t.day_of_week === "wednesday"
    ).slice(0, 3);
  }, []);

  // Recent notifications
  const recentNotifications = useMemo(() => {
    return mockNotifications
      .filter((n) => n.user_id === user?.id)
      .slice(0, 3);
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Welcome & Identity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-card p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">
            Academic Term: Fall 2026
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">
            Welcome back, {user?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            College ID: <strong className="text-slate-200">{user?.college_id}</strong> • Department:{" "}
            <strong className="text-slate-200">{user?.department_id ? "Computer Science & Engineering" : "General"}</strong> • Semester {user?.semester || 6}, Section {user?.section || "A"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/student/timetable">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1.5" />
              View Timetable
            </Button>
          </Link>
          <Link href="/student/exemptions">
            <Button variant="primary" size="sm">
              <FileQuestion className="h-4 w-4 mr-1.5" />
              Request Exemption
            </Button>
          </Link>
        </div>
      </div>

      {/* Attendance Alert if low */}
      {attendanceSummary.isBelowThreshold && (
        <Alert variant="warning" title="Institutional Attendance Warning (<75%)">
          Your cumulative attendance is currently {attendanceSummary.percentage}%, which is below the required 75% institutional threshold. Please contact your academic advisor or submit medical exemption documentation.
        </Alert>
      )}

      {/* Top Academic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Attendance (Circular Gauge & Bunk Preview) */}
        <Link href="/student/attendance" className="block group sm:col-span-2">
          <Card className="hover:border-brand-blue transition-all h-full bg-surface-card border-surface-200">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <CircularAttendance
                percentage={attendanceSummary.percentage}
                totalEligible={attendanceSummary.totalEligible}
                totalAttended={attendanceSummary.totalAttended}
                isBelowThreshold={attendanceSummary.isBelowThreshold}
                compact={true}
              />
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 group-hover:text-brand-blue transition-colors pt-3 border-t border-surface-200/50">
                <span>View Full Circular Gauge & Bunk Planner</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 2: Assessment Average */}
        <Link href="/student/assessments" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quiz & Marks Average
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-navy">
                  {assessmentAverage}%
                </span>
                <span className="text-xs text-slate-500">
                  ({publishedAssessments.length} published)
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Official scores across enrolled Fall 2026 courses
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>View All Assessments</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 3: Pending Exemptions */}
        <Link href="/student/exemptions" className="block group">
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
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-navy">
                  {pendingExemptions.length}
                </span>
                <span className="text-xs text-slate-500">in review</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {pendingExemptions.length > 0
                  ? "Awaiting departmental verification"
                  : "All submitted requests reviewed"}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>Manage Exemptions</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 4: Enrolled Courses */}
        <Link href="/student/attendance" className="block group">
          <Card className="hover:border-brand-blue transition-all h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Courses
                </span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-navy">
                  {studentOfferings.length}
                </span>
                <span className="text-xs text-slate-500">active courses</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                10 Total Credits this semester
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-brand-blue transition-colors">
                <span>View Attendance Logs</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Subject-wise attendance & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Subject-Wise Attendance Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subject-Wise Attendance Summary</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Official attendance metrics calculated from conducted sessions
                </p>
              </div>
              <Link href="/student/attendance">
                <Button variant="ghost" size="sm" className="text-xs text-brand-blue">
                  Full Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendanceSummary.subjectBreakdown.map((subject) => (
                <div
                  key={subject.courseOfferingId}
                  className="p-4 rounded-lg border border-surface-200 bg-surface-50/50 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-navy">
                          {subject.courseCode}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-700">
                          {subject.courseTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Instructor: {subject.facultyName} • Section {subject.section}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-lg font-bold ${
                          subject.attendancePercentage >= 75
                            ? "text-status-success"
                            : "text-status-warning"
                        }`}
                      >
                        {subject.attendancePercentage}%
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {subject.attendedSessions} / {subject.eligibleSessions} sessions
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 w-full bg-surface-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        subject.attendancePercentage >= 75
                          ? "bg-status-success"
                          : "bg-status-warning"
                      }`}
                      style={{ width: `${Math.min(100, subject.attendancePercentage)}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex gap-3">
                      <span>Present: <strong className="text-slate-700">{subject.presentCount}</strong></span>
                      <span>Late: <strong className="text-slate-700">{subject.lateCount}</strong></span>
                      <span>Excused: <strong className="text-slate-700">{subject.excusedCount}</strong></span>
                      <span>Absent: <strong className="text-slate-700">{subject.absentCount}</strong></span>
                    </div>
                    {subject.isBelowThreshold && (
                      <span className="text-status-danger font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low Attendance
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Published Quiz Scores Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Published Assessments</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Officially published scores authorized for your student record
                </p>
              </div>
              <Link href="/student/assessments">
                <Button variant="ghost" size="sm" className="text-xs text-brand-blue">
                  All Marks <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-surface-100">
                {publishedAssessments.map((score) => (
                  <div key={score.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{score.courseCode}</Badge>
                        <h4 className="text-xs font-semibold text-slate-900">
                          {score.assessmentTitle}
                        </h4>
                      </div>
                      {score.remarks && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          &quot;{score.remarks}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-brand-navy">
                        {score.marksObtained} / {score.maxMarks}
                      </span>
                      <p className="text-[10px] text-status-success font-semibold">
                        {score.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Today's Schedule & Notifications */}
        <div className="space-y-6">
          {/* Schedule Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Monday, Oct 19, 2026</p>
              </div>
              <Link href="/student/timetable">
                <Button variant="ghost" size="sm" className="text-xs text-brand-blue">
                  Timetable
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingClasses.map((item) => {
                const offering = studentOfferings.find((o) => o.id === item.course_offering_id);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-surface-200 bg-surface-50/50 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-md bg-white border border-surface-200 text-brand-blue shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {offering?.course?.code}: {offering?.course?.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {formatTime(item.start_time)} – {formatTime(item.end_time)}
                      </p>
                      <p className="text-[11px] text-brand-blue font-medium mt-0.5">
                        Room: {item.room}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Academic Notifications Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Alerts</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Important academic notices</p>
              </div>
              <Link href="/student/notifications">
                <Button variant="ghost" size="sm" className="text-xs text-brand-blue">
                  All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "/student/notifications"}
                  className="block p-3 rounded-lg border border-surface-200 hover:border-brand-blue/50 hover:bg-surface-50/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      {notif.title}
                    </span>
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-status-danger" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
