# CampusOne — College Academic Management Portal

**CampusOne** is an enterprise-grade, responsive academic portal engineered for higher education institutions. It provides unified, role-isolated portals for **Students**, **Faculty**, and **Administrators**, handling attendance tracking, academic assessments and quizzes, formal absence exemption workflows with private document storage, timetable scheduling, collegiate identity management, system notifications, and an extensible college portal sync engine.

---

## 1. Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & `@tailwindcss/forms`
- **Database**: PostgreSQL (Supabase) with Row Level Security (RLS)
- **Storage**: Supabase Storage with Private Document Buckets
- **Forms & Validation**: Zod & React Hook Form
- **Component Atoms**: Accessible Dialogs, Sticky Responsive Tables, Badges, Tabs, Alerts
- **Testing**: Vitest, React Testing Library, and Playwright E2E

---

## 2. Visual Design System

CampusOne adopts an institutional, distraction-free aesthetic:
- **Primary Navy**: `#183153` (`brand-navy`)
- **Accent Blue**: `#4779D8` (`brand-blue`)
- **Surfaces**: `#F8FAFC` (neutral background), `#FFFFFF` (card surfaces), `#0F172A` (text)
- **Approved / Healthy**: `#16A34A` / `#DCFCE7` (Green)
- **Pending / Caution**: `#D97706` / `#FEF3C7` (Amber)
- **Rejected / Critical**: `#DC2626` / `#FEE2E2` (Red)

---

## 3. Application Routes & Server Route Protection

All routes are strictly guarded at the server level via Next.js `middleware.ts`. Direct URL access to unauthorized portals automatically redirects to `/unauthorized` or `/login`.

### Public Routes
| Route | Description |
|---|---|
| `/login` | Academic authentication with role-based quick test selectors |
| `/forgot-password` | Password recovery workflow for institutional accounts |
| `/unauthorized` | Server-side access restriction warning display |

### Student Portal (`/student/*`)
| Route | Features |
|---|---|
| `/student/dashboard` | Overall attendance gauge, subject cards, latest quiz marks, pending exemptions, today's timetable |
| `/student/attendance` | Official attendance log, term/subject filters, percentage calculations (cancelled classes excluded) |
| `/student/assessments` | Published quiz/midterm scores only; strict isolation prevents peer score exposure |
| `/student/exemptions` | Session selector, reason input, private document upload, status tracker, cancellation of pending requests |
| `/student/timetable` | Weekly matrix grid and daily agenda with classroom locations and faculty tags |
| `/student/profile` | Official identity (College ID, Department, Semester, Section); authorized self-editable contact fields |
| `/student/notifications` | Academic alerts with read/unread tracking and direct navigation links |

### Faculty Portal (`/faculty/*`)
| Route | Features |
|---|---|
| `/faculty/dashboard` | Assigned classes overview, today's lecture schedule, pending exemption review count |
| `/faculty/classes` | Student roster for assigned offerings with academic contact info |
| `/faculty/attendance` | Batch attendance entry (Present/Absent/Late/Excused), "Mark All Present" tool, submission confirmation dialog, audit logging |
| `/faculty/assessments` | Assessment creation, student grading sheet, max marks validation, publish/unpublish confirmation modal |
| `/faculty/exemptions` | Course-specific review queue, private document inspection, approve/reject actions with mandatory comments |
| `/faculty/timetable` | Faculty's weekly teaching schedule and room allocations |

### Admin Console (`/admin/*`)
| Route | Features |
|---|---|
| `/admin/dashboard` | University metrics: active students, faculty, offerings, attendance health, sync status |
| `/admin/users` | User management directory, account activation/deactivation, controlled role provisioning with audit logging |
| `/admin/academics` | Department, academic term, master course catalog, course offerings, and section management |
| `/admin/timetable` | Timetable builder with room collision and conflict detection |
| `/admin/exemptions` | College-wide exemption oversight with status and departmental filters |
| `/admin/integrations` | CollegePortalAdapter status, connection ping, manual sync triggers, reconciliation reports |
| `/admin/audit-logs` | Immutable audit log viewer with actor attribution, entity ID, and JSON change diffs |
| `/admin/settings` | Configurable institutional policies (minimum attendance threshold, late arrival weight, session timeouts) |

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+)

### Installation
```bash
# Navigate to the project root
cd campusone

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect to `/student/dashboard` or `/login`.

---

## 5. Test Accounts (Zero-Setup Development Mode)

The portal includes pre-configured deterministic accounts for testing:

| Role | Name | Email | Password |
|---|---|---|---|
| **Student** | Arjun Mehta | `arjun.mehta@student.campusone.edu` | `password123` |
| **Faculty** | Prof. Rajesh Sharma | `prof.sharma@campusone.edu` | `password123` |
| **Admin** | Dr. Eleanor Vance | `admin@campusone.edu` | `password123` |

> [!TIP]
> **Dev Role Switcher**: When logged into any dashboard, click the **Role** badge in the top header to instantly switch between Student, Faculty, and Admin personas without logging out.

---

## 6. Database Migrations & Seeding

All database migrations are versioned under `supabase/migrations/`:
1. `001_initial_schema.sql`: 17 core entities, foreign keys, check constraints, enums, triggers (`check_assessment_score_max`), and query indexes.
2. `002_rls_policies.sql`: Strict default-deny Row Level Security policies enforcing cross-role isolation and peer score concealment.
3. `003_storage_buckets.sql`: Private `exemption-documents` bucket configuration.

### Running the Deterministic Seed Script
```bash
npm run db:seed
```
*Note: The seed script includes a strict safety guard that aborts execution if `NODE_ENV === 'production'` or a production Supabase URL is detected.*

---

## 7. Automated Testing Suite

CampusOne includes Vitest unit/component tests and Playwright end-to-end tests:

```bash
# Run Vitest unit & component tests
npm run test:unit

# Run TypeScript strict typechecking
npm run typecheck

# Run Next.js production build
npm run build

# Run Playwright E2E tests (requires running dev server or webServer)
npm run test:e2e
```

---

## 8. College Portal Integration Adapter

CampusOne implements a provider-independent server interface `CollegePortalAdapter` (`lib/integrations/adapter.ts`).
- `DevelopmentPortalAdapter` (`lib/integrations/development-adapter.ts`) provides deterministic synchronization with simulated latency, retry handling, and fault injection.
- Reconciles student identities, course catalogs, student enrollments, attendance feeds, and examination scores.
- Failed sync attempts are logged with safe error summaries in `sync_runs` and accessible via `/admin/integrations`.
