import {
  AttendancePolicy,
  AttendanceRecord,
  ClassSession,
  CourseOffering,
  ExemptionRequest,
  OverallAttendanceSummary,
  SubjectAttendanceSummary,
} from "@/types/database";

export const DEFAULT_ATTENDANCE_POLICY: AttendancePolicy = {
  lateArrivalWeight: 1.0,
  excusedTreatedAsAttended: true,
  minimumThresholdPercentage: 75.0,
};

export interface CalculateAttendanceInput {
  offerings: CourseOffering[];
  sessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  approvedExemptions?: ExemptionRequest[];
  policy?: Partial<AttendancePolicy>;
  referenceDate?: string; // YYYY-MM-DD, defaults to today
}

/**
 * Calculates deterministic institutional attendance metrics across subjects and aggregate.
 * Does not rely on static DB stored percentages.
 */
export function calculateAttendance(input: CalculateAttendanceInput): OverallAttendanceSummary {
  const policy: AttendancePolicy = {
    ...DEFAULT_ATTENDANCE_POLICY,
    ...input.policy,
  };

  const refDate = input.referenceDate || new Date().toISOString().split("T")[0];

  // Set of session IDs that have approved exemptions for this student
  const approvedExemptSessionIds = new Set<string>();
  if (input.approvedExemptions) {
    for (const ex of input.approvedExemptions) {
      if (ex.status === "approved") {
        approvedExemptSessionIds.add(ex.class_session_id);
      }
    }
  }

  // Index attendance records by class_session_id
  const recordBySessionId = new Map<string, AttendanceRecord>();
  for (const record of input.attendanceRecords) {
    recordBySessionId.set(record.class_session_id, record);
  }

  // Group sessions by course_offering_id
  const sessionsByOffering = new Map<string, ClassSession[]>();
  for (const session of input.sessions) {
    const list = sessionsByOffering.get(session.course_offering_id) || [];
    list.push(session);
    sessionsByOffering.set(session.course_offering_id, list);
  }

  const subjectBreakdown: SubjectAttendanceSummary[] = [];

  let grandTotalEligible = 0;
  let grandTotalAttended = 0;
  let grandTotalConducted = 0;

  for (const offering of input.offerings) {
    const offeringSessions = sessionsByOffering.get(offering.id) || [];

    let totalConductedSessions = 0;
    let eligibleSessions = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let cancelledCount = 0;

    for (const session of offeringSessions) {
      if (session.status === "cancelled") {
        cancelledCount++;
        continue; // Cancelled sessions never count toward eligible sessions
      }

      // Check if session has occurred up to the reference date and was submitted
      const isPastOrToday = session.session_date <= refDate;
      if (!isPastOrToday || !session.is_attendance_submitted) {
        continue;
      }

      totalConductedSessions++;
      eligibleSessions++;

      const record = recordBySessionId.get(session.id);
      const isExempt = approvedExemptSessionIds.has(session.id);

      if (isExempt) {
        // Exemption overrides absent/unmarked
        excusedCount++;
      } else if (!record) {
        // Conducted session with no record is considered absent
        absentCount++;
      } else {
        switch (record.status) {
          case "present":
            presentCount++;
            break;
          case "late":
            lateCount++;
            break;
          case "excused":
            excusedCount++;
            break;
          case "absent":
          default:
            absentCount++;
            break;
        }
      }
    }

    // Compute attended weighted score
    let weightedAttended = presentCount + (lateCount * policy.lateArrivalWeight);
    let effectiveDenominator = eligibleSessions;

    if (policy.excusedTreatedAsAttended) {
      weightedAttended += excusedCount;
    } else {
      effectiveDenominator = Math.max(0, eligibleSessions - excusedCount);
    }

    const attendancePercentage =
      effectiveDenominator > 0
        ? Math.min(100, Math.max(0, Math.round((weightedAttended / effectiveDenominator) * 1000) / 10))
        : 100.0;

    const isBelowThreshold = eligibleSessions > 0 && attendancePercentage < policy.minimumThresholdPercentage;

    subjectBreakdown.push({
      courseOfferingId: offering.id,
      courseCode: offering.course?.code || "N/A",
      courseTitle: offering.course?.title || "Untitled Course",
      facultyName: offering.faculty?.full_name || "Faculty Member",
      section: offering.section,
      totalConductedSessions,
      eligibleSessions,
      attendedSessions: Math.round(weightedAttended * 10) / 10,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      cancelledCount,
      attendancePercentage,
      isBelowThreshold,
    });

    grandTotalConducted += totalConductedSessions;
    grandTotalEligible += effectiveDenominator;
    grandTotalAttended += weightedAttended;
  }

  const overallPercentage =
    grandTotalEligible > 0
      ? Math.min(100, Math.max(0, Math.round((grandTotalAttended / grandTotalEligible) * 1000) / 10))
      : 100.0;

  const isBelowThreshold = grandTotalEligible > 0 && overallPercentage < policy.minimumThresholdPercentage;

  return {
    totalConducted: grandTotalConducted,
    totalEligible: grandTotalEligible,
    totalAttended: Math.round(grandTotalAttended * 10) / 10,
    percentage: overallPercentage,
    isBelowThreshold,
    subjectBreakdown,
  };
}
