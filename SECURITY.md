# CampusOne — Deployment & Application Security Checklist

This document details the security posture, Row Level Security architecture, and pre-production deployment verification checklist for **CampusOne**.

---

## 1. Threat Model & Security Controls Matrix

| Threat Category | Potential Attack Vector | CampusOne Defense & Implementation |
|---|---|---|
| **Privilege Escalation** | Student sends PATCH request to `/api/profile` updating `role: 'admin'` | RLS policy `Users update own contact info` enforces `role = (SELECT role FROM profiles WHERE id = auth.uid())`. Self-elevation is rejected at PostgreSQL kernel level. |
| **Peer Score Leakage** | Student intercepts API response or crafts ID query for another student's marks | RLS policy on `assessment_scores` requires `student_id = auth.uid() AND assessment.is_published = true`. Faculty can only query for assigned courses. |
| **Unpublished Marks Exposure** | Student attempts to read draft/pre-published exam evaluations | Assessments and scores RLS explicitly denies reads where `is_published = false` to students, even for their own records. |
| **Attendance Tampering** | Student submits POST to modify official attendance status | Attendance table has zero INSERT/UPDATE policies for students. Only assigned faculty and admins possess write access. |
| **Cross-Course Modification** | Faculty member attempts to grade or mark attendance for an unassigned class | PostgreSQL function `is_faculty_assigned_to_offering(course_offering_id)` checks assignment before granting write permissions. |
| **Audit Trail Erasure** | Compromised user attempts to delete or alter past actions | `audit_logs` table has NO `UPDATE` or `DELETE` RLS policies. It is append-only by design. |
| **Document Exposure** | Public scraper attempts to read private exemption medical files | Bucket `exemption-documents` is strictly private (`public = false`). Access is gated via short-lived signed URLs (60-second validity). |
| **URL Route Tampering** | Unauthorized user navigates directly to `/admin/*` or `/faculty/*` | Edge `middleware.ts` evaluates session cookies before route execution, redirecting unauthorized actors to `/unauthorized`. |

---

## 2. Pre-Deployment Security Checklist

Before deploying CampusOne to a production environment:

- [ ] **Environment Secret Segregation**:
  - `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side environments and never prefixed with `NEXT_PUBLIC_`.
  - `.env.local` is omitted from version control (`.gitignore` verified).
- [ ] **Database RLS Verification**:
  - Run `supabase/migrations/001_initial_schema.sql` followed by `002_rls_policies.sql`.
  - Confirm that `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY` has executed for all 17 tables.
- [ ] **Storage Bucket Privacy**:
  - Run `supabase/migrations/003_storage_buckets.sql`.
  - Verify in Supabase Storage dashboard that `exemption-documents` has "Public bucket" toggled OFF.
- [ ] **Production Seed Guard**:
  - Confirm that `scripts/seed.ts` is never executed against a production database. The script automatically halts if `NODE_ENV === 'production'` or `IS_PRODUCTION === 'true'`.
- [ ] **Build Integrity & Automated Tests**:
  - Run `npm run typecheck` to verify strict zero-error TypeScript validation.
  - Run `npm run test:unit` to verify attendance formulas, exemption state machines, and marks bounds.
  - Run `npm run build` to confirm all 29 routes compile and prerender cleanly.
- [ ] **Authentication Rate Limiting**:
  - Enable rate limiting on `/login` and `/forgot-password` at the reverse-proxy or Cloudflare / Supabase Auth tier to prevent brute-force attacks.
- [ ] **HTTPS & Transport Security**:
  - Enforce TLS 1.3 across all subdomains.
  - Set `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

---

## 3. Institutional Policy Verification

- **Attendance Denominator Integrity**: Cancelled sessions must never be marked as eligible or conducted.
- **Exemption Credit**: Approved exemptions automatically grant attendance credit without penalizing eligibility.
- **Marks Validation**: Assessment scores exceeding the maximum allowed marks are blocked both by client Zod validation and PostgreSQL triggers.
