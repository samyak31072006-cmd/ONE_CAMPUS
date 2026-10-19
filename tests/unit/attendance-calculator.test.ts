import { describe, it, expect } from "vitest";
import { calculateAttendance } from "@/lib/attendance/calculator";
import { ClassSession, CourseOffering, AttendanceRecord, ExemptionRequest } from "@/types/database";

describe("Attendance Calculation Engine", () => {
  const dummyOffering: CourseOffering = {
    id: "off-1",
    course_id: "c-1",
    academic_term_id: "t-1",
    faculty_id: "f-1",
    section: "A",
    capacity: 60,
    status: "active",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    course: {
      id: "c-1",
      code: "CS301",
      title: "Data Structures",
      department_id: "d-1",
      credits: 4,
      description: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  };

  it("calculates 100% attendance when all sessions are attended", () => {
    const sessions: ClassSession[] = [
      {
        id: "s-1",
        course_offering_id: "off-1",
        session_date: "2026-10-01",
        start_time: "09:00:00",
        end_time: "10:30:00",
        room: "A-1",
        topic: "Topic 1",
        status: "completed",
        is_attendance_submitted: true,
        attendance_submitted_at: "2026-10-01T11:00:00Z",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
      {
        id: "s-2",
        course_offering_id: "off-1",
        session_date: "2026-10-03",
        start_time: "09:00:00",
        end_time: "10:30:00",
        room: "A-1",
        topic: "Topic 2",
        status: "completed",
        is_attendance_submitted: true,
        attendance_submitted_at: "2026-10-03T11:00:00Z",
        created_at: "2026-10-03T00:00:00Z",
        updated_at: "2026-10-03T00:00:00Z",
      },
    ];

    const records: AttendanceRecord[] = [
      {
        id: "r-1",
        class_session_id: "s-1",
        student_id: "stu-1",
        status: "present",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-01T10:30:00Z",
        updated_at: "2026-10-01T10:30:00Z",
      },
      {
        id: "r-2",
        class_session_id: "s-2",
        student_id: "stu-1",
        status: "present",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-03T10:30:00Z",
        updated_at: "2026-10-03T10:30:00Z",
      },
    ];

    const result = calculateAttendance({
      offerings: [dummyOffering],
      sessions,
      attendanceRecords: records,
      referenceDate: "2026-10-10",
    });

    expect(result.totalEligible).toBe(2);
    expect(result.totalAttended).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.isBelowThreshold).toBe(false);
  });

  it("strictly excludes cancelled sessions from the eligible session denominator", () => {
    const sessions: ClassSession[] = [
      {
        id: "s-1",
        course_offering_id: "off-1",
        session_date: "2026-10-01",
        start_time: "09:00:00",
        end_time: "10:30:00",
        room: "A-1",
        topic: "Topic 1",
        status: "completed",
        is_attendance_submitted: true,
        attendance_submitted_at: "2026-10-01T11:00:00Z",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
      {
        id: "s-2",
        course_offering_id: "off-1",
        session_date: "2026-10-03",
        start_time: "09:00:00",
        end_time: "10:30:00",
        room: "A-1",
        topic: "Cancelled Lecture",
        status: "cancelled", // Explicitly cancelled!
        is_attendance_submitted: false,
        attendance_submitted_at: null,
        created_at: "2026-10-03T00:00:00Z",
        updated_at: "2026-10-03T00:00:00Z",
      },
    ];

    const records: AttendanceRecord[] = [
      {
        id: "r-1",
        class_session_id: "s-1",
        student_id: "stu-1",
        status: "present",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-01T10:30:00Z",
        updated_at: "2026-10-01T10:30:00Z",
      },
    ];

    const result = calculateAttendance({
      offerings: [dummyOffering],
      sessions,
      attendanceRecords: records,
      referenceDate: "2026-10-10",
    });

    // Denominator must be 1, NOT 2!
    expect(result.totalEligible).toBe(1);
    expect(result.totalAttended).toBe(1);
    expect(result.percentage).toBe(100);
    expect(result.subjectBreakdown[0].cancelledCount).toBe(1);
  });

  it("applies approved exemption override to absent sessions", () => {
    const sessions: ClassSession[] = [
      {
        id: "s-1",
        course_offering_id: "off-1",
        session_date: "2026-10-01",
        start_time: "09:00:00",
        end_time: "10:30:00",
        room: "A-1",
        topic: "Topic 1",
        status: "completed",
        is_attendance_submitted: true,
        attendance_submitted_at: "2026-10-01T11:00:00Z",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
      {
        id: "s-2",
        course_offering_id: "off-1",
        session_date: "2026-10-03",
        start_time: "09:00:00",
        end_time: "10:30:00",
        room: "A-1",
        topic: "Topic 2",
        status: "completed",
        is_attendance_submitted: true,
        attendance_submitted_at: "2026-10-03T11:00:00Z",
        created_at: "2026-10-03T00:00:00Z",
        updated_at: "2026-10-03T00:00:00Z",
      },
    ];

    // s-1 is present, s-2 was marked absent
    const records: AttendanceRecord[] = [
      {
        id: "r-1",
        class_session_id: "s-1",
        student_id: "stu-1",
        status: "present",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-01T10:30:00Z",
        updated_at: "2026-10-01T10:30:00Z",
      },
      {
        id: "r-2",
        class_session_id: "s-2",
        student_id: "stu-1",
        status: "absent",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-03T10:30:00Z",
        updated_at: "2026-10-03T10:30:00Z",
      },
    ];

    // But student has an APPROVED exemption for s-2!
    const exemptions: ExemptionRequest[] = [
      {
        id: "ex-1",
        student_id: "stu-1",
        class_session_id: "s-2",
        reason: "Hospitalization",
        document_url: "medical.pdf",
        document_filename: "medical.pdf",
        status: "approved",
        submitted_at: "2026-10-04T00:00:00Z",
        updated_at: "2026-10-05T00:00:00Z",
      },
    ];

    const result = calculateAttendance({
      offerings: [dummyOffering],
      sessions,
      attendanceRecords: records,
      approvedExemptions: exemptions,
      referenceDate: "2026-10-10",
    });

    expect(result.totalEligible).toBe(2);
    expect(result.totalAttended).toBe(2); // 1 present + 1 excused
    expect(result.percentage).toBe(100);
    expect(result.subjectBreakdown[0].excusedCount).toBe(1);
    expect(result.subjectBreakdown[0].absentCount).toBe(0);
  });

  it("flags attendance warning when percentage falls below 75%", () => {
    const sessions: ClassSession[] = Array.from({ length: 4 }).map((_, i) => ({
      id: `s-${i + 1}`,
      course_offering_id: "off-1",
      session_date: `2026-10-0${i + 1}`,
      start_time: "09:00:00",
      end_time: "10:30:00",
      room: "A-1",
      topic: `Topic ${i + 1}`,
      status: "completed",
      is_attendance_submitted: true,
      attendance_submitted_at: "2026-10-01T11:00:00Z",
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-01T00:00:00Z",
    }));

    // Student attended 2 out of 4 (50%)
    const records: AttendanceRecord[] = [
      {
        id: "r-1",
        class_session_id: "s-1",
        student_id: "stu-1",
        status: "present",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-01T10:30:00Z",
        updated_at: "2026-10-01T10:30:00Z",
      },
      {
        id: "r-2",
        class_session_id: "s-2",
        student_id: "stu-1",
        status: "present",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-02T10:30:00Z",
        updated_at: "2026-10-02T10:30:00Z",
      },
      {
        id: "r-3",
        class_session_id: "s-3",
        student_id: "stu-1",
        status: "absent",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-03T10:30:00Z",
        updated_at: "2026-10-03T10:30:00Z",
      },
      {
        id: "r-4",
        class_session_id: "s-4",
        student_id: "stu-1",
        status: "absent",
        remarks: null,
        marked_by: "f-1",
        marked_at: "2026-10-04T10:30:00Z",
        updated_at: "2026-10-04T10:30:00Z",
      },
    ];

    const result = calculateAttendance({
      offerings: [dummyOffering],
      sessions,
      attendanceRecords: records,
      referenceDate: "2026-10-10",
    });

    expect(result.percentage).toBe(50);
    expect(result.isBelowThreshold).toBe(true);
    expect(result.subjectBreakdown[0].isBelowThreshold).toBe(true);
  });
});
