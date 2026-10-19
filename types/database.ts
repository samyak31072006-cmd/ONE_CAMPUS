// CampusOne TypeScript Type Definitions
// Maps to 17 Supabase PostgreSQL entities and application models

export type UserRole = 'student' | 'faculty' | 'admin';
export type CourseOfferingStatus = 'upcoming' | 'active' | 'completed';
export type EnrollmentStatus = 'enrolled' | 'dropped' | 'completed';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AssessmentType = 'quiz' | 'assignment' | 'midterm' | 'final' | 'project';
export type ExemptionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
export type ExemptionAction = 'review_started' | 'approved' | 'rejected' | 'cancelled';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type NotificationType = 'attendance' | 'assessment' | 'exemption' | 'timetable' | 'system';
export type SyncType = 'students' | 'courses' | 'enrollments' | 'attendance' | 'assessments' | 'timetable' | 'full';
export type SyncStatus = 'running' | 'completed' | 'failed' | 'partial';

export interface Department {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  college_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id: string | null;
  department?: Department | null;
  semester: number | null;
  section: string | null;
  phone: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department_id: string;
  department?: Department;
  credits: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseOffering {
  id: string;
  course_id: string;
  course?: Course;
  academic_term_id: string;
  academic_term?: AcademicTerm;
  faculty_id: string;
  faculty?: Profile;
  section: string;
  capacity: number;
  status: CourseOfferingStatus;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_offering_id: string;
  course_offering?: CourseOffering;
  student_id: string;
  student?: Profile;
  status: EnrollmentStatus;
  enrolled_at: string;
  updated_at: string;
}

export interface ClassSession {
  id: string;
  course_offering_id: string;
  course_offering?: CourseOffering;
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  room: string;
  topic: string | null;
  status: SessionStatus;
  is_attendance_submitted: boolean;
  attendance_submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  class_session_id: string;
  class_session?: ClassSession;
  student_id: string;
  student?: Profile;
  status: AttendanceStatus;
  remarks: string | null;
  marked_by: string;
  marked_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  course_offering_id: string;
  course_offering?: CourseOffering;
  title: string;
  assessment_type: AssessmentType;
  max_marks: number;
  weightage: number | null;
  due_date: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentScore {
  id: string;
  assessment_id: string;
  assessment?: Assessment;
  student_id: string;
  student?: Profile;
  marks_obtained: number;
  remarks: string | null;
  graded_by: string;
  graded_at: string;
  created_at: string;
  updated_at: string;
}

export interface ExemptionRequest {
  id: string;
  student_id: string;
  student?: Profile;
  class_session_id: string;
  class_session?: ClassSession;
  reason: string;
  document_url: string | null;
  document_filename: string | null;
  status: ExemptionStatus;
  submitted_at: string;
  updated_at: string;
  reviews?: ExemptionReview[];
}

export interface ExemptionReview {
  id: string;
  exemption_request_id: string;
  reviewer_id: string;
  reviewer?: Profile;
  action: ExemptionAction;
  comments: string | null;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  course_offering_id: string;
  course_offering?: CourseOffering;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  room: string;
  effective_start_date: string;
  effective_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface ExternalIdMapping {
  id: string;
  internal_entity_type: string;
  internal_id: string;
  external_id: string;
  source_system: string;
  last_synced_at: string;
  created_at: string;
}

export interface SyncRun {
  id: string;
  source_system: string;
  sync_type: SyncType;
  status: SyncStatus;
  records_processed: number;
  records_succeeded: number;
  records_failed: number;
  error_summary: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor?: Profile | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Attendance Calculation Models
export interface AttendancePolicy {
  lateArrivalWeight: number; // e.g. 1.0 (counts as full attendance), 0.75, or 0.5
  excusedTreatedAsAttended: boolean; // true = counts in numerator, false = excludes from denominator
  minimumThresholdPercentage: number; // default 75%
}

export interface SubjectAttendanceSummary {
  courseOfferingId: string;
  courseCode: string;
  courseTitle: string;
  facultyName: string;
  section: string;
  totalConductedSessions: number;
  eligibleSessions: number;
  attendedSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  cancelledCount: number;
  attendancePercentage: number;
  isBelowThreshold: boolean;
}

export interface OverallAttendanceSummary {
  totalConducted: number;
  totalEligible: number;
  totalAttended: number;
  percentage: number;
  isBelowThreshold: boolean;
  subjectBreakdown: SubjectAttendanceSummary[];
}
