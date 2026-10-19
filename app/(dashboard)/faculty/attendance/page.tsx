"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockCourseOfferings,
  mockClassSessions,
  mockAttendanceRecords,
  mockEnrollments,
  mockProfiles,
  mockAuditLogs,
} from "@/lib/mock-data";
import { AttendanceStatus } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate, formatTime } from "@/lib/utils";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Save,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function FacultyAttendancePage() {
  const { user } = useAuth();

  // Assigned course offerings
  const assignedOfferings = useMemo(() => {
    return mockCourseOfferings.filter(
      (o) => o.faculty_id === user?.id || user?.role === "admin"
    );
  }, [user?.id, user?.role]);

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    assignedOfferings[0]?.id || ""
  );

  const currentOffering = useMemo(() => {
    return assignedOfferings.find((o) => o.id === selectedOfferingId);
  }, [assignedOfferings, selectedOfferingId]);

  // Sessions for this offering
  const sessions = useMemo(() => {
    if (!selectedOfferingId) return [];
    return mockClassSessions
      .filter((s) => s.course_offering_id === selectedOfferingId)
      .sort((a, b) => b.session_date.localeCompare(a.session_date));
  }, [selectedOfferingId]);

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[0]?.id || ""
  );

  // Enrolled students for selected offering
  const enrolledStudents = useMemo(() => {
    if (!selectedOfferingId) return [];
    const enrollments = mockEnrollments.filter(
      (e) => e.course_offering_id === selectedOfferingId && e.status === "enrolled"
    );
    return enrollments.map((e) => mockProfiles.find((p) => p.id === e.student_id)!);
  }, [selectedOfferingId]);

  // Current session object
  const currentSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId);
  }, [sessions, selectedSessionId]);

  // Attendance state for current session: studentId -> status
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    for (const r of mockAttendanceRecords) {
      if (r.class_session_id === selectedSessionId) {
        initial[r.student_id] = r.status;
      }
    }
    // Default remaining to present
    for (const s of enrolledStudents) {
      if (!initial[s.id]) {
        initial[s.id] = "present";
      }
    }
    return initial;
  });

  // Track remarks per student
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    for (const s of enrolledStudents) {
      updated[s.id] = "present";
    }
    setAttendanceState(updated);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsConfirmOpen(false);

      // Audit log simulation
      mockAuditLogs.unshift({
        id: `aud-${Date.now()}`,
        actor_id: user?.id || null,
        actor: user || undefined,
        action: "ATTENDANCE_CORRECTED",
        entity_type: "class_session",
        entity_id: selectedSessionId,
        old_values: null,
        new_values: attendanceState,
        ip_address: "127.0.0.1",
        created_at: new Date().toISOString(),
      });

      setSuccessMessage(
        `Official attendance successfully finalized for ${enrolledStudents.length} students. Recorded in audit trail.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 450);
  };

  const counts = useMemo(() => {
    let p = 0, a = 0, l = 0, e = 0;
    for (const s of enrolledStudents) {
      const st = attendanceState[s.id] || "present";
      if (st === "present") p++;
      else if (st === "absent") a++;
      else if (st === "late") l++;
      else if (st === "excused") e++;
    }
    return { present: p, absent: a, late: l, excused: e, total: enrolledStudents.length };
  }, [enrolledStudents, attendanceState]);

  return (
    <div className="space-y-6">
      {/* Header & Session Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Attendance Marking & Corrections</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record batch student attendance for conducted classes with official confirmation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              value={selectedOfferingId}
              onChange={(e) => {
                setSelectedOfferingId(e.target.value);
                setSuccessMessage(null);
              }}
              className="text-xs py-1.5 h-9"
            >
              {assignedOfferings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.course?.code} (Sec {o.section})
                </option>
              ))}
            </Select>
          </div>

          <div className="w-64">
            <Select
              value={selectedSessionId}
              onChange={(e) => {
                setSelectedSessionId(e.target.value);
                setSuccessMessage(null);
              }}
              className="text-xs py-1.5 h-9"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatDate(s.session_date)} ({formatTime(s.start_time)}) - {s.topic || "Lecture"}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" title="Attendance Logged">
          {successMessage}
        </Alert>
      )}

      {/* Session Metadata & Fast Actions Card */}
      {currentSession && (
        <Card className="bg-white">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={currentSession.status === "completed" ? "success" : "neutral"}>
                  {currentSession.status.toUpperCase()}
                </Badge>
                <h3 className="text-sm font-bold text-brand-navy">
                  {currentSession.topic || "Class Lecture"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Room: <strong className="text-slate-700">{currentSession.room}</strong> • Time:{" "}
                {formatTime(currentSession.start_time)} to {formatTime(currentSession.end_time)} • Session Date: {formatDate(currentSession.session_date)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllPresent}
                className="text-xs"
              >
                <Check className="h-4 w-4 mr-1 text-status-success" />
                Mark All Present
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
                className="text-xs"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Submit Official Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Counting Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg border border-surface-200 bg-white">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Students</span>
          <span className="text-xl font-bold text-brand-navy block mt-0.5">{counts.total}</span>
        </div>
        <div className="p-3 rounded-lg border border-green-200 bg-green-50/50">
          <span className="text-[10px] text-green-700 uppercase font-semibold">Present</span>
          <span className="text-xl font-bold text-status-success block mt-0.5">{counts.present}</span>
        </div>
        <div className="p-3 rounded-lg border border-red-200 bg-red-50/50">
          <span className="text-[10px] text-red-700 uppercase font-semibold">Absent</span>
          <span className="text-xl font-bold text-status-danger block mt-0.5">{counts.absent}</span>
        </div>
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
          <span className="text-[10px] text-amber-700 uppercase font-semibold">Late</span>
          <span className="text-xl font-bold text-status-warning block mt-0.5">{counts.late}</span>
        </div>
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
          <span className="text-[10px] text-blue-700 uppercase font-semibold">Excused</span>
          <span className="text-xl font-bold text-brand-blue block mt-0.5">{counts.excused}</span>
        </div>
      </div>

      {/* Batch Attendance Marking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance Sheet</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark status for each enrolled student. Changes will be officially stamped upon submission.
          </p>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll / ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Attendance Status</TableHead>
                  <TableHead>Optional Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledStudents.map((student) => {
                  const currentStatus = attendanceState[student.id] || "present";

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-semibold text-xs text-brand-navy whitespace-nowrap">
                        {student.college_id}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-slate-800 whitespace-nowrap">
                        {student.full_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="inline-flex rounded-md shadow-xs" role="group">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "present")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-l-md border transition-all ${
                              currentStatus === "present"
                                ? "bg-status-success text-white border-status-success"
                                : "bg-white text-slate-600 border-surface-300 hover:bg-surface-100"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "late")}
                            className={`px-3 py-1.5 text-xs font-semibold border-t border-b transition-all ${
                              currentStatus === "late"
                                ? "bg-status-warning text-white border-status-warning"
                                : "bg-white text-slate-600 border-surface-300 hover:bg-surface-100"
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "excused")}
                            className={`px-3 py-1.5 text-xs font-semibold border-t border-b transition-all ${
                              currentStatus === "excused"
                                ? "bg-brand-blue text-white border-brand-blue"
                                : "bg-white text-slate-600 border-surface-300 hover:bg-surface-100"
                            }`}
                          >
                            Excused
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "absent")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-r-md border transition-all ${
                              currentStatus === "absent"
                                ? "bg-status-danger text-white border-status-danger"
                                : "bg-white text-slate-600 border-surface-300 hover:bg-surface-100"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <input
                          type="text"
                          placeholder="e.g. Joined 10m late"
                          value={remarksState[student.id] || ""}
                          onChange={(e) =>
                            setRemarksState({ ...remarksState, [student.id]: e.target.value })
                          }
                          className="w-full text-xs rounded border border-surface-300 px-2 py-1 placeholder:text-slate-300 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Official Attendance Submission"
        description="Submitting will update official college records and trigger an institutional audit log entry."
        maxWidth="md"
      >
        <div className="space-y-3 py-2 text-xs text-slate-700 leading-relaxed">
          <p>
            You are recording attendance for{" "}
            <strong className="text-brand-navy">
              {currentOffering?.course?.code} (Section {currentOffering?.section})
            </strong>{" "}
            on <strong className="text-slate-900">{currentSession ? formatDate(currentSession.session_date) : ""}</strong>.
          </p>

          <div className="p-3 rounded-lg bg-surface-100 space-y-1">
            <div className="flex justify-between">
              <span>Present:</span>
              <strong className="text-status-success">{counts.present}</strong>
            </div>
            <div className="flex justify-between">
              <span>Late Arrival:</span>
              <strong className="text-status-warning">{counts.late}</strong>
            </div>
            <div className="flex justify-between">
              <span>Excused:</span>
              <strong className="text-brand-blue">{counts.excused}</strong>
            </div>
            <div className="flex justify-between">
              <span>Absent:</span>
              <strong className="text-status-danger">{counts.absent}</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            This privileged academic action will be sealed under your faculty identity ({user?.college_id}).
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirmSubmit}
            isLoading={isSubmitting}
          >
            Confirm & Save to Record
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
