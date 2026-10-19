import { test, expect } from "@playwright/test";

test.describe("CampusOne Academic Portal End-to-End Test Suite", () => {
  test("loads login page and displays academic authentication options", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/CampusOne/);
    await expect(page.getByRole("heading", { name: "Sign in to CampusOne" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Student" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Faculty" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Admin" })).toBeVisible();
  });

  test("student workflow: logs in and views attendance summary and assessments", async ({ page }) => {
    await page.goto("/login");

    // Select Student demo persona
    await page.getByRole("button", { name: "Student", exact: true }).click();
    await page.getByRole("button", { name: /Sign In to Student Portal/i }).click();

    // Verify redirected to student dashboard
    await page.waitForURL("**/student/dashboard");
    await expect(page.getByRole("heading", { name: /Welcome back, Arjun/i })).toBeVisible();
    await expect(page.getByText("Overall Attendance")).toBeVisible();

    // Navigate to Attendance details
    await page.goto("/student/attendance");
    await expect(page.getByRole("heading", { name: "Attendance Records" })).toBeVisible();
    await expect(page.getByText("Eligible Sessions")).toBeVisible();

    // Navigate to Assessments
    await page.goto("/student/assessments");
    await expect(page.getByRole("heading", { name: /Academic Assessments/i })).toBeVisible();
    await expect(page.getByText("Published Academic Grades")).toBeVisible();
  });

  test("negative security test: student is blocked from accessing admin console", async ({ page, context }) => {
    // Set student cookie
    await context.addCookies([
      { name: "campusone_user_id", value: "s0000000-0000-0000-0000-000000000001", domain: "localhost", path: "/" },
      { name: "campusone_role", value: "student", domain: "localhost", path: "/" },
    ]);

    // Attempt direct URL tampering to admin dashboard
    await page.goto("/admin/dashboard");

    // Expect server-side redirection to /unauthorized
    await page.waitForURL("**/unauthorized");
    await expect(page.getByRole("heading", { name: "Access Restricted" })).toBeVisible();
    await expect(page.getByText("Authorized Role:")).toBeVisible();
  });

  test("faculty workflow: inspects assigned classes and grades assessment", async ({ page, context }) => {
    // Set faculty cookie (Prof. Sharma)
    await context.addCookies([
      { name: "campusone_user_id", value: "f0000000-0000-0000-0000-000000000001", domain: "localhost", path: "/" },
      { name: "campusone_role", value: "faculty", domain: "localhost", path: "/" },
    ]);

    await page.goto("/faculty/dashboard");
    await expect(page.getByRole("heading", { name: /Welcome, Prof. Rajesh Sharma/i })).toBeVisible();

    // Open Assigned Classes
    await page.goto("/faculty/classes");
    await expect(page.getByRole("heading", { name: /Assigned Classes & Student Rosters/i })).toBeVisible();
    await expect(page.getByText("Course Enrollment Roster")).toBeVisible();

    // Open Assessments
    await page.goto("/faculty/assessments");
    await expect(page.getByRole("heading", { name: "Assessments & Marks Entry" })).toBeVisible();
  });

  test("admin workflow: oversees user directory and integration sync", async ({ page, context }) => {
    // Set admin cookie (Dr. Eleanor Vance)
    await context.addCookies([
      { name: "campusone_user_id", value: "a0000000-0000-0000-0000-000000000001", domain: "localhost", path: "/" },
      { name: "campusone_role", value: "admin", domain: "localhost", path: "/" },
    ]);

    await page.goto("/admin/dashboard");
    await expect(page.getByRole("heading", { name: "CampusOne Administration" })).toBeVisible();

    // Open Integrations
    await page.goto("/admin/integrations");
    await expect(page.getByRole("heading", { name: "College Portal Integration Engine" })).toBeVisible();
    await expect(page.getByText("Connection Status")).toBeVisible();

    // Open Audit Logs
    await page.goto("/admin/audit-logs");
    await expect(page.getByRole("heading", { name: "Institutional Audit Logs" })).toBeVisible();
  });
});
