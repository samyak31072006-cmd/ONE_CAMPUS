"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockAcademicTerms,
  mockCourseOfferings,
  mockClassSessions,
  mockAttendanceRecords,
  mockExemptionRequests,
} from "@/lib/mock-data";
import { calculateAttendance } from "@/lib/attendance/calculator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { CircularAttendance } from "@/components/attendance/circular-attendance";
import { formatTime, formatDate } from "@/lib/utils";
import { CalendarCheck, Filter, Info, AlertTriangle, ShieldCheck } from "lucide-react";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState(mockAcademicTerms[0].id);
  const [selectedOffering, setSelectedOffering] = useState<string>("all");

  const studentOfferings = useMemo(() => {
    return mockCourseOfferings.slice(0, 3);
  }, []);

  const filteredOfferings = useMemo(() => {
    if (selectedOffering === "all") return studentOfferings;
    return studentOfferings.filter((o) => o.id === selectedOffering);
  }, [studentOfferings, selectedOffering]);

  const studentRecords = useMemo(() => {
    return mockAttendanceRecords.filter((r) => r.student_id === user?.id);
  }, [user?.id]);

  const approvedExemptions = useMemo(() => {
    return mockExemptionRequests.filter(
      (e) => e.student_id === user?.id && e.status === "approved"
    );
  }, [user?.id]);

  // Overall & subject metrics
  const attendanceMetrics = useMemo(() => {
    return calculateAttendance({
      offerings: filteredOfferings,
      sessions: mockClassSessions,
      attendanceRecords: studentRecords,
      approvedExemptions,
      referenceDate: "2026-10-19",
    });
  }, [filteredOfferings, studentRecords, approvedExemptions]);

  const courseSummaries = useMemo(() => {
    return attendanceMetrics.subjectBreakdown.map((s) => ({
      courseCode: s.courseCode,
      courseTitle: s.courseTitle,
      percentage: Math.round(s.attendancePercentage),
      totalAttended: Math.round(s.attendedSessions),
      totalEligible: s.eligibleSessions,
    }));
  }, [attendanceMetrics.subjectBreakdown]);

  // Session history table rows
  const sessionHistory = useMemo(() => {
    const offeringIds = new Set(filteredOfferings.map((o) => o.id));
    const relevantSessions = mockClassSessions.filter((s) =>
      offeringIds.has(s.course_offering_id)
    );

    const recordMap = new Map(studentRecords.map((r) => [r.class_session_id, r]));
    const approvedExemptSessionIds = new Set(
      approvedExemptions.map((e) => e.class_session_id)
    );

    return relevantSessions
      .map((session) => {
        const offering = studentOfferings.find(
          (o) => o.id === session.course_offering_id
        );
        const record = recordMap.get(session.id);
        const isApprovedExempt = approvedExemptSessionIds.has(session.id);

        let displayStatus = record ? record.status : "unmarked";
        if (session.status === "cancelled") {
          displayStatus = "cancelled";
        } else if (isApprovedExempt) {
          displayStatus = "excused";
        }

        return {
          id: session.id,
          date: session.session_date,
          startTime: session.start_time,
          endTime: session.end_time,
          courseCode: offering?.course?.code || "CS",
          courseTitle: offering?.course?.title || "Course",
          topic: session.topic || "Class lecture",
          sessionStatus: session.status,
          attendanceStatus: displayStatus,
          remarks: record?.remarks || (isApprovedExempt ? "Exemption Approved (Dean/Faculty)" : null),
          isConducted: session.is_attendance_submitted,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredOfferings, studentOfferings, studentRecords, approvedExemptions]);

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Attendance Records & Bunk Planner</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official institutional attendance tracking, circular progress gauge, and predictive bunk calculator
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="text-xs py-1.5 h-9"
            >
              {mockAcademicTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.is_active ? "(Current)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-52">
            <Select
              value={selectedOffering}
              onChange={(e) => setSelectedOffering(e.target.value)}
              className="text-xs py-1.5 h-9"
            >
              <option value="all">All Enrolled Courses</option>
              {studentOfferings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.course?.code} - {offering.course?.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Institutional Policy Notice */}
      <Alert variant="info" title="Institutional Attendance Policy">
        Attendance percentages are computed strictly from eligible, submitted sessions. Cancelled sessions are excluded from the denominator. Approved exemptions automatically grant attendance credit without penalizing eligibility.
      </Alert>

      {/* Interactive Circular Attendance & Predictive Bunk Planner */}
      <CircularAttendance
        percentage={attendanceMetrics.percentage}
        totalEligible={attendanceMetrics.totalEligible}
        totalAttended={attendanceMetrics.totalAttended}
        isBelowThreshold={attendanceMetrics.isBelowThreshold}
        courseBreakdown={selectedOffering === "all" ? courseSummaries : []}
      />

      {/* Detailed Session History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Session-by-Session Attendance Logs</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological log of scheduled, conducted, and cancelled classes
          </p>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Lecture Topic</TableHead>
                  <TableHead>Session Status</TableHead>
                  <TableHead>My Attendance</TableHead>
                  <TableHead>Remarks / Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No session records found for the selected filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessionHistory.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap font-medium text-xs">
                        <div>{formatDate(row.date)}</div>
                        <div className="text-[11px] text-slate-400">
                          {formatTime(row.startTime)} - {formatTime(row.endTime)}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="primary">{row.courseCode}</Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-xs">
                        <span className="font-medium text-slate-800">{row.topic}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.sessionStatus === "completed" && (
                          <Badge variant="success">Conducted</Badge>
                        )}
                        {row.sessionStatus === "cancelled" && (
                          <Badge variant="danger">Cancelled</Badge>
                        )}
                        {row.sessionStatus === "scheduled" && (
                          <Badge variant="neutral">Upcoming</Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.attendanceStatus === "present" && (
                          <Badge variant="success">Present</Badge>
                        )}
                        {row.attendanceStatus === "late" && (
                          <Badge variant="warning">Late Arrival</Badge>
                        )}
                        {row.attendanceStatus === "excused" && (
                          <Badge variant="info">Excused / Exemption</Badge>
                        )}
                        {row.attendanceStatus === "absent" && (
                          <Badge variant="danger">Absent</Badge>
                        )}
                        {row.attendanceStatus === "cancelled" && (
                          <span className="text-xs text-slate-400 italic">Excluded</span>
                        )}
                        {row.attendanceStatus === "unmarked" && (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {row.remarks || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>
    </div>
  );
}
