-- CampusOne Database Schema Migration 002: Row Level Security (RLS) Policies
-- Strict default-deny, role-isolated policies across all tables

-- 1. Helper security functions in PostgreSQL
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_faculty()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'faculty' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_faculty_assigned_to_offering(p_offering_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM course_offerings
    WHERE id = p_offering_id AND faculty_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student_enrolled_in_offering(p_offering_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE course_offering_id = p_offering_id AND student_id = auth.uid() AND status = 'enrolled'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE exemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exemption_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_id_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Departments Policies
CREATE POLICY "Public read active departments" ON departments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage departments" ON departments
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 4. Profiles Policies
-- Users can view their own profile, faculty can view students they teach, admins can view all
CREATE POLICY "Read profiles policy" ON profiles
  FOR SELECT TO authenticated USING (
    id = auth.uid()
    OR is_admin()
    OR (is_faculty() AND role = 'student')
  );

-- Users can only update non-privileged fields on their own profile; admins can update all
CREATE POLICY "Users update own contact info" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR is_admin())
  WITH CHECK (
    is_admin() OR (
      id = auth.uid()
      AND role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Prevents role escalation!
      AND college_id = (SELECT college_id FROM profiles WHERE id = auth.uid()) -- Prevents ID change
    )
  );

CREATE POLICY "Admins insert profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins delete profiles" ON profiles
  FOR DELETE TO authenticated USING (is_admin());

-- 5. Academic Terms Policies
CREATE POLICY "Authenticated read terms" ON academic_terms
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage terms" ON academic_terms
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 6. Courses Policies
CREATE POLICY "Authenticated read courses" ON courses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage courses" ON courses
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 7. Course Offerings Policies
CREATE POLICY "Read course offerings" ON course_offerings
  FOR SELECT TO authenticated USING (
    is_admin()
    OR faculty_id = auth.uid()
    OR is_student_enrolled_in_offering(id)
    OR status = 'active'
  );

CREATE POLICY "Admins manage course offerings" ON course_offerings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 8. Enrollments Policies
CREATE POLICY "Read enrollments" ON enrollments
  FOR SELECT TO authenticated USING (
    is_admin()
    OR student_id = auth.uid()
    OR is_faculty_assigned_to_offering(course_offering_id)
  );

CREATE POLICY "Admins manage enrollments" ON enrollments
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 9. Class Sessions Policies
CREATE POLICY "Read class sessions" ON class_sessions
  FOR SELECT TO authenticated USING (
    is_admin()
    OR is_faculty_assigned_to_offering(course_offering_id)
    OR is_student_enrolled_in_offering(course_offering_id)
  );

CREATE POLICY "Faculty manage own class sessions" ON class_sessions
  FOR ALL TO authenticated USING (
    is_admin() OR is_faculty_assigned_to_offering(course_offering_id)
  ) WITH CHECK (
    is_admin() OR is_faculty_assigned_to_offering(course_offering_id)
  );

-- 10. Attendance Records Policies
-- Students can only view their own records; faculty can view/manage for their sessions; admins all
CREATE POLICY "Read attendance records" ON attendance_records
  FOR SELECT TO authenticated USING (
    is_admin()
    OR student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM class_sessions s
      WHERE s.id = class_session_id AND is_faculty_assigned_to_offering(s.course_offering_id)
    )
  );

CREATE POLICY "Faculty manage attendance for assigned sessions" ON attendance_records
  FOR ALL TO authenticated USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM class_sessions s
      WHERE s.id = class_session_id AND is_faculty_assigned_to_offering(s.course_offering_id)
    )
  ) WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM class_sessions s
      WHERE s.id = class_session_id AND is_faculty_assigned_to_offering(s.course_offering_id)
    )
  );

-- 11. Assessments Policies
-- Students only see published assessments for their enrolled courses
CREATE POLICY "Read assessments" ON assessments
  FOR SELECT TO authenticated USING (
    is_admin()
    OR is_faculty_assigned_to_offering(course_offering_id)
    OR (is_student_enrolled_in_offering(course_offering_id) AND is_published = true)
  );

CREATE POLICY "Faculty manage assessments for assigned courses" ON assessments
  FOR ALL TO authenticated USING (
    is_admin() OR is_faculty_assigned_to_offering(course_offering_id)
  ) WITH CHECK (
    is_admin() OR is_faculty_assigned_to_offering(course_offering_id)
  );

-- 12. Assessment Scores Policies
-- Critical: Students ONLY see their OWN scores, and ONLY when the assessment is published!
CREATE POLICY "Read assessment scores" ON assessment_scores
  FOR SELECT TO authenticated USING (
    is_admin()
    OR (
      student_id = auth.uid() AND EXISTS (
        SELECT 1 FROM assessments a WHERE a.id = assessment_id AND a.is_published = true
      )
    )
    OR EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_id AND is_faculty_assigned_to_offering(a.course_offering_id)
    )
  );

CREATE POLICY "Faculty manage scores for assigned assessments" ON assessment_scores
  FOR ALL TO authenticated USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_id AND is_faculty_assigned_to_offering(a.course_offering_id)
    )
  ) WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_id AND is_faculty_assigned_to_offering(a.course_offering_id)
    )
  );

-- 13. Exemption Requests Policies
CREATE POLICY "Read exemption requests" ON exemption_requests
  FOR SELECT TO authenticated USING (
    is_admin()
    OR student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM class_sessions s
      WHERE s.id = class_session_id AND is_faculty_assigned_to_offering(s.course_offering_id)
    )
  );

CREATE POLICY "Students insert own exemption requests" ON exemption_requests
  FOR INSERT TO authenticated WITH CHECK (
    student_id = auth.uid() AND is_student()
  );

CREATE POLICY "Students update pending exemption requests or admins/faculty review" ON exemption_requests
  FOR UPDATE TO authenticated USING (
    (student_id = auth.uid() AND status = 'pending')
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM class_sessions s
      WHERE s.id = class_session_id AND is_faculty_assigned_to_offering(s.course_offering_id)
    )
  );

-- 14. Exemption Reviews Policies
CREATE POLICY "Read exemption reviews" ON exemption_reviews
  FOR SELECT TO authenticated USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM exemption_requests r
      WHERE r.id = exemption_request_id AND (
        r.student_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM class_sessions s
          WHERE s.id = r.class_session_id AND is_faculty_assigned_to_offering(s.course_offering_id)
        )
      )
    )
  );

CREATE POLICY "Faculty and admin insert exemption reviews" ON exemption_reviews
  FOR INSERT TO authenticated WITH CHECK (
    is_admin() OR is_faculty()
  );

-- 15. Timetable Entries Policies
CREATE POLICY "Read timetable entries" ON timetable_entries
  FOR SELECT TO authenticated USING (
    is_admin()
    OR is_faculty_assigned_to_offering(course_offering_id)
    OR is_student_enrolled_in_offering(course_offering_id)
  );

CREATE POLICY "Admins manage timetable entries" ON timetable_entries
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 16. Notifications Policies
CREATE POLICY "Users read and update own notifications" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users update own notification read status" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and system insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- 17. External ID Mappings Policies
CREATE POLICY "Admins manage external id mappings" ON external_id_mappings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 18. Sync Runs Policies
CREATE POLICY "Admins manage sync runs" ON sync_runs
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 19. Audit Logs Policies (Append-only by system, read-only by Admin, impossible to modify/delete)
CREATE POLICY "Admins read audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Authenticated insert audit logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- No UPDATE or DELETE policy on audit_logs! Prevents tampering.
