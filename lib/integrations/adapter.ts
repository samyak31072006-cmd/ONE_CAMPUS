// CampusOne College Portal Integration Adapter Interface
// Provider-independent specification for external college SIS / ERP synchronization

import { SyncType } from "@/types/database";

export interface SyncOptions {
  termId?: string;
  departmentId?: string;
  dryRun?: boolean;
  forceAll?: boolean;
  batchSize?: number;
}

export interface SyncItemResult {
  externalId: string;
  internalId?: string;
  action: "created" | "updated" | "skipped" | "failed";
  error?: string;
}

export interface SyncResult {
  syncType: SyncType;
  sourceSystem: string;
  startedAt: string;
  completedAt: string;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  items: SyncItemResult[];
  errorSummary?: string | null;
  reconciliationDiscrepancies?: Array<{
    field: string;
    externalValue: unknown;
    internalValue: unknown;
    resolution: "source_applied" | "internal_retained" | "manual_review_needed";
  }>;
}

export interface ConnectionStatus {
  connected: boolean;
  providerName: string;
  endpointUrl: string;
  latencyMs: number;
  lastCheckedAt: string;
  version?: string;
  capabilities: {
    studentSync: boolean;
    courseSync: boolean;
    enrollmentSync: boolean;
    attendanceImport: boolean;
    assessmentImport: boolean;
    timetableImport: boolean;
    sso: boolean;
  };
  details?: string;
}

export interface CollegePortalAdapter {
  readonly providerName: string;
  readonly isDevelopmentMode: boolean;

  testConnection(): Promise<ConnectionStatus>;
  syncStudents(options?: SyncOptions): Promise<SyncResult>;
  syncCourses(options?: SyncOptions): Promise<SyncResult>;
  syncEnrollments(options?: SyncOptions): Promise<SyncResult>;
  syncAttendance(options?: SyncOptions): Promise<SyncResult>;
  syncAssessments(options?: SyncOptions): Promise<SyncResult>;
  syncTimetable(options?: SyncOptions): Promise<SyncResult>;
  runFullSync(options?: SyncOptions): Promise<SyncResult[]>;
}
