import { describe, it, expect } from "vitest";
import { DevelopmentPortalAdapter } from "@/lib/integrations/development-adapter";

describe("College Portal Integration Adapter", () => {
  it("successfully tests ERP connection and returns capabilities", async () => {
    const adapter = new DevelopmentPortalAdapter();
    const status = await adapter.testConnection();

    expect(status.connected).toBe(true);
    expect(status.providerName).toContain("CampusOne College ERP");
    expect(status.capabilities.studentSync).toBe(true);
    expect(status.capabilities.attendanceImport).toBe(true);
    expect(status.capabilities.assessmentImport).toBe(true);
  });

  it("performs deterministic student synchronization with reconciliation stats", async () => {
    const adapter = new DevelopmentPortalAdapter();
    const result = await adapter.syncStudents();

    expect(result.syncType).toBe("students");
    expect(result.recordsProcessed).toBeGreaterThan(0);
    expect(result.recordsFailed).toBe(0);
    expect(result.items.some((i) => i.action === "updated")).toBe(true);
    expect(result.items.some((i) => i.action === "created")).toBe(true);
  });

  it("handles simulated network failures and reports safe error summaries", async () => {
    const adapter = new DevelopmentPortalAdapter({ simulateFailures: true });
    const result = await adapter.syncStudents();

    expect(result.recordsFailed).toBeGreaterThan(0);
    expect(result.errorSummary).toBeDefined();
    expect(result.errorSummary).toContain("Network timeout");
    expect(result.items.some((i) => i.action === "failed")).toBe(true);
  });

  it("executes full synchronization suite across academic entities", async () => {
    const adapter = new DevelopmentPortalAdapter();
    const full = await adapter.runFullSync();

    expect(full.length).toBe(6);
    const types = full.map((f) => f.syncType);
    expect(types).toContain("courses");
    expect(types).toContain("students");
    expect(types).toContain("enrollments");
    expect(types).toContain("timetable");
    expect(types).toContain("attendance");
    expect(types).toContain("assessments");
  });
});
