-- CampusOne Database Schema Migration 001: Initial Schema
-- 17 Core Entities with Constraints, Foreign Keys, Indexes, and Audit Logging

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE course_offering_status AS ENUM ('upcoming', 'active', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('enrolled', 'dropped', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE assessment_type AS ENUM ('quiz', 'assignment', 'midterm', 'final', 'project');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE exemption_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE exemption_action AS ENUM ('review_started', 'approved', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('attendance', 'assessment', 'exemption', 'timetable', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE sync_type AS ENUM ('students', 'courses', 'enrollments', 'attendance', 'assessments', 'timetable', 'full');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE sync_status AS ENUM ('running', 'completed', 'failed', 'partial');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Profiles (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  semester INTEGER CHECK (semester >= 1 AND semester <= 12),
  section TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Academic Terms
CREATE TABLE IF NOT EXISTS academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_term_dates CHECK (end_date >= start_date)
);

-- 4. Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  credits INTEGER NOT NULL DEFAULT 3 CHECK (credits > 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Course Offerings
CREATE TABLE IF NOT EXISTS course_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  section TEXT NOT NULL DEFAULT 'A',
  capacity INTEGER NOT NULL DEFAULT 60 CHECK (capacity > 0),
  status course_offering_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_course_offering UNIQUE (course_id, academic_term_id, section)
);

-- 6. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'enrolled',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_student_enrollment UNIQUE (course_offering_id, student_id)
);

-- 7. Class Sessions
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT NOT NULL,
  topic TEXT,
  status session_status NOT NULL DEFAULT 'scheduled',
  is_attendance_submitted BOOLEAN NOT NULL DEFAULT false,
  attendance_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_session_times CHECK (end_time > start_time)
);

-- 8. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status attendance_status NOT NULL,
  remarks TEXT,
  marked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_session_student_attendance UNIQUE (class_session_id, student_id)
);

-- 9. Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assessment_type assessment_type NOT NULL DEFAULT 'quiz',
  max_marks NUMERIC(5,2) NOT NULL CHECK (max_marks > 0),
  weightage NUMERIC(5,2) CHECK (weightage >= 0 AND weightage <= 100),
  due_date TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Assessment Scores
CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(5,2) NOT NULL CHECK (marks_obtained >= 0),
  remarks TEXT,
  graded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_assessment_student_score UNIQUE (assessment_id, student_id)
);

-- Trigger to validate marks_obtained <= max_marks
CREATE OR REPLACE FUNCTION check_assessment_score_max()
RETURNS TRIGGER AS $$
DECLARE
  v_max_marks NUMERIC(5,2);
BEGIN
  SELECT max_marks INTO v_max_marks FROM assessments WHERE id = NEW.assessment_id;
  IF NEW.marks_obtained > v_max_marks THEN
    RAISE EXCEPTION 'marks_obtained (%) cannot exceed maximum marks allowed for assessment (%)',
      NEW.marks_obtained, v_max_marks;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_assessment_score_max ON assessment_scores;
CREATE TRIGGER trg_check_assessment_score_max
BEFORE INSERT OR UPDATE ON assessment_scores
FOR EACH ROW EXECUTE FUNCTION check_assessment_score_max();

-- 11. Exemption Requests
CREATE TABLE IF NOT EXISTS exemption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  document_url TEXT,
  document_filename TEXT,
  status exemption_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_student_session_exemption UNIQUE (student_id, class_session_id)
);

-- 12. Exemption Reviews
CREATE TABLE IF NOT EXISTS exemption_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exemption_request_id UUID NOT NULL REFERENCES exemption_requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  action exemption_action NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Timetable Entries
CREATE TABLE IF NOT EXISTS timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT NOT NULL,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_timetable_times CHECK (end_time > start_time)
);

-- 14. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. External ID Mappings
CREATE TABLE IF NOT EXISTS external_id_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_entity_type TEXT NOT NULL,
  internal_id UUID NOT NULL,
  external_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_external_mapping UNIQUE (source_system, internal_entity_type, external_id)
);

-- 16. Sync Runs
CREATE TABLE IF NOT EXISTS sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system TEXT NOT NULL,
  sync_type sync_type NOT NULL DEFAULT 'full',
  status sync_status NOT NULL DEFAULT 'running',
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_succeeded INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 17. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_term ON course_offerings(academic_term_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_faculty ON course_offerings(faculty_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_offering ON enrollments(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_offering_date ON class_sessions(course_offering_id, session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(class_session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_offering ON assessments(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_student ON assessment_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_exemption_requests_student ON exemption_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_exemption_requests_session ON exemption_requests(class_session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_runs_status_started ON sync_runs(status, started_at DESC);
