// Development & Testing Implementation of CollegePortalAdapter
// Provides deterministic fixtures, reconciliation reporting, and simulated failure injection

import {
  CollegePortalAdapter,
  ConnectionStatus,
  SyncOptions,
  SyncResult,
} from "./adapter";

export class DevelopmentPortalAdapter implements CollegePortalAdapter {
  readonly providerName = "CampusOne College ERP (Development Sandbox)";
  readonly isDevelopmentMode = true;

  private simulateFailures: boolean = false;

  constructor(options?: { simulateFailures?: boolean }) {
    if (options?.simulateFailures) {
      this.simulateFailures = options.simulateFailures;
    }
  }

  setSimulateFailures(val: boolean) {
    this.simulateFailures = val;
  }

  async testConnection(): Promise<ConnectionStatus> {
    const start = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 80));
    return {
      connected: true,
      providerName: this.providerName,
      endpointUrl: "https://sandbox-erp.campusone.internal/api/v2",
      latencyMs: Date.now() - start,
      lastCheckedAt: new Date().toISOString(),
      version: "2.14.0-mock",
      capabilities: {
        studentSync: true,
        courseSync: true,
        enrollmentSync: true,
        attendanceImport: true,
        assessmentImport: true,
        timetableImport: true,
        sso: true,
      },
      details: "Connected to CampusOne Mock SIS/ERP server. All endpoints verified.",
    };
  }

  async syncStudents(options?: SyncOptions): Promise<SyncResult> {
    const startedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 120));

    if (this.simulateFailures) {
      return {
        syncType: "students",
        sourceSystem: "campusone-sis",
        startedAt,
        completedAt: new Date().toISOString(),
        recordsProcessed: 5,
        recordsSucceeded: 3,
        recordsFailed: 2,
        errorSummary: "Network timeout occurred while reconciling student records for section B",
        items: [
          { externalId: "EXT-STU-001", internalId: "stu-1", action: "updated" },
          { externalId: "EXT-STU-002", internalId: "stu-2", action: "updated" },
          { externalId: "EXT-STU-003", internalId: "stu-3", action: "created" },
          { externalId: "EXT-STU-004", action: "failed", error: "Duplicate identity document: Aadhaar/SSN conflict" },
          { externalId: "EXT-STU-005", action: "failed", error: "Missing required Department code: 'BIO'" },
        ],
      };
    }

    return {
      syncType: "students",
      sourceSystem: "campusone-sis",
      startedAt,
      completedAt: new Date().toISOString(),
      recordsProcessed: 6,
      recordsSucceeded: 6,
      recordsFailed: 0,
      errorSummary: null,
      items: [
        { externalId: "EXT-STU-001", internalId: "stu-1", action: "updated" },
        { externalId: "EXT-STU-002", internalId: "stu-2", action: "updated" },
        { externalId: "EXT-STU-003", internalId: "stu-3", action: "updated" },
        { externalId: "EXT-STU-004", internalId: "stu-4", action: "created" },
        { externalId: "EXT-STU-005", internalId: "stu-5", action: "created" },
        { externalId: "EXT-STU-006", internalId: "stu-6", action: "skipped" },
      ],
      reconciliationDiscrepancies: [
        {
          field: "phone",
          externalValue: "+91-9876543210",
          internalValue: "+91-9876543211",
          resolution: "internal_retained",
        },
      ],
    };
  }

  async syncCourses(options?: SyncOptions): Promise<SyncResult> {
    const startedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 90));

    return {
      syncType: "courses",
      sourceSystem: "campusone-sis",
      startedAt,
      completedAt: new Date().toISOString(),
      recordsProcessed: 4,
      recordsSucceeded: 4,
      recordsFailed: 0,
      items: [
        { externalId: "EXT-CRS-CS301", internalId: "crs-1", action: "updated" },
        { externalId: "EXT-CRS-CS302", internalId: "crs-2", action: "updated" },
        { externalId: "EXT-CRS-CS303", internalId: "crs-3", action: "updated" },
        { externalId: "EXT-CRS-EC201", internalId: "crs-4", action: "created" },
      ],
    };
  }

  async syncEnrollments(options?: SyncOptions): Promise<SyncResult> {
    const startedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 110));

    return {
      syncType: "enrollments",
      sourceSystem: "campusone-sis",
      startedAt,
      completedAt: new Date().toISOString(),
      recordsProcessed: 8,
      recordsSucceeded: 8,
      recordsFailed: 0,
      items: [
        { externalId: "EXT-ENR-01", internalId: "enr-1", action: "updated" },
        { externalId: "EXT-ENR-02", internalId: "enr-2", action: "updated" },
        { externalId: "EXT-ENR-03", internalId: "enr-3", action: "updated" },
        { externalId: "EXT-ENR-04", internalId: "enr-4", action: "updated" },
        { externalId: "EXT-ENR-05", internalId: "enr-5", action: "created" },
        { externalId: "EXT-ENR-06", internalId: "enr-6", action: "created" },
        { externalId: "EXT-ENR-07", internalId: "enr-7", action: "created" },
        { externalId: "EXT-ENR-08", internalId: "enr-8", action: "created" },
      ],
    };
  }

  async syncAttendance(options?: SyncOptions): Promise<SyncResult> {
    const startedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 140));

    return {
      syncType: "attendance",
      sourceSystem: "campusone-sis",
      startedAt,
      completedAt: new Date().toISOString(),
      recordsProcessed: 24,
      recordsSucceeded: 24,
      recordsFailed: 0,
      items: [
        { externalId: "EXT-ATT-001", internalId: "att-1", action: "updated" },
        { externalId: "EXT-ATT-002", internalId: "att-2", action: "updated" },
        { externalId: "EXT-ATT-003", internalId: "att-3", action: "updated" },
      ],
    };
  }

  async syncAssessments(options?: SyncOptions): Promise<SyncResult> {
    const startedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      syncType: "assessments",
      sourceSystem: "campusone-sis",
      startedAt,
      completedAt: new Date().toISOString(),
      recordsProcessed: 5,
      recordsSucceeded: 5,
      recordsFailed: 0,
      items: [
        { externalId: "EXT-ASM-001", internalId: "asm-1", action: "updated" },
        { externalId: "EXT-ASM-002", internalId: "asm-2", action: "updated" },
      ],
    };
  }

  async syncTimetable(options?: SyncOptions): Promise<SyncResult> {
    const startedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 80));

    return {
      syncType: "timetable",
      sourceSystem: "campusone-sis",
      startedAt,
      completedAt: new Date().toISOString(),
      recordsProcessed: 12,
      recordsSucceeded: 12,
      recordsFailed: 0,
      items: [
        { externalId: "EXT-TT-001", internalId: "tt-1", action: "updated" },
        { externalId: "EXT-TT-002", internalId: "tt-2", action: "updated" },
      ],
    };
  }

  async runFullSync(options?: SyncOptions): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    results.push(await this.syncCourses(options));
    results.push(await this.syncStudents(options));
    results.push(await this.syncEnrollments(options));
    results.push(await this.syncTimetable(options));
    results.push(await this.syncAttendance(options));
    results.push(await this.syncAssessments(options));
    return results;
  }
}

// Singleton helper
let adapterInstance: CollegePortalAdapter | null = null;

export function getCollegePortalAdapter(): CollegePortalAdapter {
  if (!adapterInstance) {
    // In production with custom SIS env, we can instantiate specific SIS adapter
    adapterInstance = new DevelopmentPortalAdapter();
  }
  return adapterInstance;
}
