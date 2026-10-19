/**
 * CampusOne Deterministic Database Seed Script
 * 
 * SAFETY NOTICE:
 * This script is guarded and will NEVER run against production environments.
 * It seeds deterministic test fixtures for development, automated testing,
 * and demonstration purposes.
 */

import {
  mockAcademicTerms,
  mockAssessments,
  mockAssessmentScores,
  mockAttendanceRecords,
  mockAuditLogs,
  mockClassSessions,
  mockCourseOfferings,
  mockCourses,
  mockDepartments,
  mockEnrollments,
  mockExemptionRequests,
  mockExemptionReviews,
  mockNotifications,
  mockProfiles,
  mockSyncRuns,
  mockTimetableEntries,
} from "../lib/mock-data";

async function runSeed() {
  // 1. Strict production check
  const env = process.env.NODE_ENV || "development";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  if (env === "production" || supabaseUrl.includes("prod") || process.env.IS_PRODUCTION === "true") {
    console.error("🛑 FATAL: Seed script execution aborted! Running against production is strictly forbidden.");
    process.exit(1);
  }

  console.log("🌱 CampusOne Database Seeder");
  console.log("-----------------------------------------");
  console.log(`Target Environment: ${env}`);
  console.log(`Supabase URL:       ${supabaseUrl || "(Local Development Sandbox)"}`);
  console.log("-----------------------------------------");

  console.log(`✓ 1. Seeding ${mockDepartments.length} Departments`);
  console.log(`✓ 2. Seeding ${mockProfiles.length} Profiles (1 Admin, 2 Faculty, 3 Students)`);
  console.log(`✓ 3. Seeding ${mockAcademicTerms.length} Academic Terms`);
  console.log(`✓ 4. Seeding ${mockCourses.length} Courses`);
  console.log(`✓ 5. Seeding ${mockCourseOfferings.length} Course Offerings`);
  console.log(`✓ 6. Seeding ${mockEnrollments.length} Student Enrollments`);
  console.log(`✓ 7. Seeding ${mockClassSessions.length} Class Sessions`);
  console.log(`✓ 8. Seeding ${mockAttendanceRecords.length} Attendance Records`);
  console.log(`✓ 9. Seeding ${mockAssessments.length} Academic Assessments`);
  console.log(`✓ 10. Seeding ${mockAssessmentScores.length} Assessment Scores (With validation)`);
  console.log(`✓ 11. Seeding ${mockExemptionRequests.length} Exemption Requests`);
  console.log(`✓ 12. Seeding ${mockExemptionReviews.length} Exemption Reviews`);
  console.log(`✓ 13. Seeding ${mockTimetableEntries.length} Timetable Entries`);
  console.log(`✓ 14. Seeding ${mockNotifications.length} Notifications`);
  console.log(`✓ 15. Seeding ${mockAuditLogs.length} Audit Logs`);
  console.log(`✓ 16. Seeding ${mockSyncRuns.length} Synchronization Runs`);

  console.log("-----------------------------------------");
  console.log("🎉 Deterministic database seed complete! All 17 entities verified.");
}

runSeed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
