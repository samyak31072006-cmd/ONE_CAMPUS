# CampusOne Implementation Checklist

## Phase 1: Workspace Inspection & Architecture Verification
- [x] Inspect workspace directory (created project in `scratch/campusone`).
- [x] Verify toolchain: Node.js v24.19.0, npm 11.17.0, Git.
- [x] Document institutional rules and tech stack.
- [x] Produce comprehensive implementation checklist.

## Phase 2: Project Setup, Dependencies, Theme, Layout & Auth
- [x] Initialize `package.json` with Next.js 15, React 19, TypeScript strict mode, Tailwind CSS, Lucide icons, Zod, React Hook Form, Recharts, @supabase/ssr, Vitest, Playwright.
- [x] Configure `tailwind.config.ts` with brand palette:
  - Primary Navy `#183153`
  - Accent Blue `#4779D8`
  - Surfaces & semantic statuses (green, amber, red).
- [x] Configure `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`.
- [x] Implement reusable accessible UI component system (`Button`, `Input`, `Select`, `Dialog`, `Card`, `Badge`, `Table`, `Alert`, `Tabs`).
- [x] Implement responsive App Shell (`Sidebar`, `Header`, `MobileNav`, `AuthProvider`).
- [x] Implement authentication pages:
  - `/login` with role selection or direct email/password login and verified test accounts
  - `/forgot-password`
  - `/unauthorized`
- [x] Implement server-side route guard middleware (`middleware.ts`) enforcing role-based access to `/student/*`, `/faculty/*`, `/admin/*`.

## Phase 3: Database Migrations, RLS Policies, Test Fixtures & Seed Script
- [x] Create `supabase/migrations/001_initial_schema.sql` with 17 required entities:
  - `departments`, `profiles`, `academic_terms`, `courses`, `course_offerings`, `enrollments`, `class_sessions`, `attendance_records`, `assessments`, `assessment_scores`, `exemption_requests`, `exemption_reviews`, `timetable_entries`, `notifications`, `external_id_mappings`, `sync_runs`, `audit_logs`.
  - UUID PKs, FK cascades/restricts, timestamps, check constraints (`marks_obtained <= max_marks`), indexes.
- [x] Create `supabase/migrations/002_rls_policies.sql`:
  - RLS enabled on all tables.
  - Role-based helper functions (`is_admin`, `is_faculty`, `is_student`, `is_faculty_assigned_to_offering`).
  - Strict policies for student isolation, faculty class isolation, admin access, audit log immutability.
- [x] Create `supabase/migrations/003_storage_buckets.sql`:
  - Private bucket `exemption-documents` with strict access control and signed URLs.
- [x] Implement deterministic seed script (`scripts/seed.ts` and `supabase/seed.sql`):
  - Preloaded admin, 2 faculty, 3 students.
  - Preloaded departments, terms, courses, offerings, enrollments, sessions, attendance records, quizzes, exemptions, timetables.
  - Production guard preventing accidental runs against production.
- [x] Implement client and server Supabase data layer with deterministic development fixture fallback for offline/local resilience.

## Phase 4: Student Dashboard & 5 Academic Modules
- [x] Student Attendance Calculator (`lib/attendance/calculator.ts`):
  - Deterministic formula excluding cancelled sessions, factoring excused absences & approved exemptions.
- [x] `/student/dashboard`:
  - Overall attendance percentage gauge
  - Subject-wise breakdown cards
  - Published assessment averages & recent quizzes
  - Pending exemption counter
  - Today's upcoming timetable
  - Notifications preview
- [x] `/student/attendance`:
  - Term & subject filters
  - Detailed session-by-session history
  - Attendance counting rules note
  - Visual alerts for low attendance (<75%)
- [x] `/student/assessments`:
  - Subject selector, published quiz and exam scores
  - Weightage, max marks, marks obtained, percentage
  - Strict isolation: zero peer score leakage
- [x] `/student/exemptions`:
  - Exemption request form (session selection, reason, document upload)
  - Status tracker (pending, under review, approved, rejected, cancelled)
  - Decision comments & audit history
  - Cancellation capability for pending requests
- [x] `/student/timetable`:
  - Daily & weekly matrix views
  - Classroom, faculty name, time slot
- [x] `/student/profile`:
  - Official institutional details (College ID, Department, Semester, Section)
  - Authorized self-editable fields (contact details)
- [x] `/student/notifications`:
  - Inbox with unread indicators and category filters.

## Phase 5: Faculty & Admin Workflows
- [x] Faculty Portal:
  - `/faculty/dashboard`: Assigned classes, today's schedule, pending grading, pending exemptions.
  - `/faculty/classes`: Course offerings roster with student list.
  - `/faculty/attendance`: Session selector, batch attendance marking (Present/Absent/Late/Excused), "Mark All Present" shortcut, confirmation dialog, audit logging.
  - `/faculty/assessments`: Assessment creation, student marks entry with client & server validation against max marks, publish/unpublish confirmation modal.
  - `/faculty/exemptions`: Exemption review queue, reason & document preview, Approve/Reject action with decision comments.
  - `/faculty/timetable`: Faculty teaching schedule.
- [x] Admin Portal:
  - `/admin/dashboard`: University statistics, user counts, attendance health, sync health.
  - `/admin/users`: User management table, role assignment, user activation/deactivation, audit trail.
  - `/admin/academics`: Departments, terms, courses, offerings, student enrollment manager.
  - `/admin/timetable`: Timetable creation, room/faculty conflict checking.
  - `/admin/exemptions`: College-wide exemption oversight.
  - `/admin/integrations`: Integration configuration, sync status, manual trigger, failed job reports.
  - `/admin/audit-logs`: Audit trail viewer with search, filter, actor, timestamp, change diff.
  - `/admin/settings`: Attendance thresholds, academic policy configuration.

## Phase 6: College Portal Integration Adapter
- [x] `CollegePortalAdapter` TypeScript interface (sync students, courses, enrollments, attendance, assessments, timetable, connection status).
- [x] `DevelopmentPortalAdapter` implementation with deterministic fixtures, latency simulation, reconciliation reports, and failure injection for retries.
- [x] Admin integrations UI with sync triggers, status cards, and reconciliation logs (`/admin/integrations` and `/api/sync`).

## Phase 7: Automated Testing & Production Builds
- [x] Vitest unit & component tests:
  - Attendance calculator edge cases (100%, 0%, cancelled sessions, late credit, approved exemption).
  - Assessment marks validation (`marks <= max_marks`, no negative marks).
  - Exemption status state transitions.
  - College portal sync idempotency & retry.
  - Accessible UI component tests (Button, Badge, Dialog, Alert).
  - 18 tests passed across 5 test files with 100% success.
- [x] Playwright E2E tests (`tests/e2e/campusone.spec.ts`).
- [x] TypeScript strict typecheck (`npm run typecheck` passed with 0 errors).
- [x] Next.js production build (`npm run build` compiled and prerendered 100% of all 29 routes).

## Phase 8: Documentation & Security Deliverables
- [x] `.env.example` with clean placeholders.
- [x] Comprehensive `README.md` with setup, local development, migration instructions, test runs, and seed guide.
- [x] Deployment and Security Checklist document (`SECURITY.md`).
