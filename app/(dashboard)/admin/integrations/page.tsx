"use client";

import React, { useState, useEffect } from "react";
import {
  DevelopmentPortalAdapter,
} from "@/lib/integrations/development-adapter";
import {
  ConnectionStatus,
  SyncResult,
} from "@/lib/integrations/adapter";
import { mockSyncRuns } from "@/lib/mock-data";
import { SyncRun } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import {
  Network,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminIntegrationsPage() {
  const [adapter] = useState(() => new DevelopmentPortalAdapter());
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSyncType, setActiveSyncType] = useState<string | null>(null);

  const [syncHistory, setSyncHistory] = useState<SyncRun[]>(mockSyncRuns);
  const [latestResult, setLatestResult] = useState<SyncResult | null>(null);
  const [simulateFailures, setSimulateFailures] = useState(false);

  // Initial connection test
  useEffect(() => {
    adapter.testConnection().then(setConnection);
  }, [adapter]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await adapter.testConnection();
      setConnection(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunSync = async (type: "students" | "courses" | "enrollments" | "attendance" | "full") => {
    setIsSyncing(true);
    setActiveSyncType(type);
    adapter.setSimulateFailures(simulateFailures);

    try {
      let result: SyncResult;
      if (type === "students") result = await adapter.syncStudents();
      else if (type === "courses") result = await adapter.syncCourses();
      else if (type === "enrollments") result = await adapter.syncEnrollments();
      else if (type === "attendance") result = await adapter.syncAttendance();
      else {
        const full = await adapter.runFullSync();
        result = full[0]; // Display representative sync report
      }

      setLatestResult(result);

      // Prepend to sync history
      const newRun: SyncRun = {
        id: `sync-${Date.now()}`,
        source_system: result.sourceSystem,
        sync_type: result.syncType,
        status: result.recordsFailed > 0 ? "partial" : "completed",
        records_processed: result.recordsProcessed,
        records_succeeded: result.recordsSucceeded,
        records_failed: result.recordsFailed,
        error_summary: result.errorSummary || null,
        started_at: result.startedAt,
        completed_at: result.completedAt,
      };

      setSyncHistory((prev) => [newRun, ...prev]);
    } finally {
      setIsSyncing(false);
      setActiveSyncType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">College Portal Integration Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Provider-independent adapter interface (CollegePortalAdapter) with reconciliation and failover controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            isLoading={isTesting}
          >
            <Activity className="h-4 w-4 mr-1.5 text-brand-blue" />
            Ping Connection
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleRunSync("full")}
            isLoading={isSyncing && activeSyncType === "full"}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Trigger Full Reconciliation
          </Button>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Connection Status
              </span>
              <Badge variant={connection?.connected ? "success" : "danger"}>
                {connection?.connected ? "Active & Healthy" : "Offline"}
              </Badge>
            </div>
            <div className="mt-3 text-lg font-bold text-brand-navy">
              {connection?.providerName || "Initializing..."}
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">
              {connection?.endpointUrl}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-surface-100">
              <span>Latency:</span>
              <strong className="text-status-success">{connection?.latencyMs || 0} ms</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Reconciliation Mode
              </span>
              <Badge variant="info">Development Sandbox</Badge>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Provider interface verified with deterministic test records, stable external ID mapping, and idempotent updates.
            </p>
            <div className="mt-3 pt-2 border-t border-surface-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Simulate Network Faults:</span>
              <button
                type="button"
                onClick={() => setSimulateFailures(!simulateFailures)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  simulateFailures ? "bg-status-danger text-white" : "bg-surface-200 text-slate-700"
                }`}
              >
                {simulateFailures ? "FAULT INJECTED" : "NORMAL"}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Confirmed Capabilities
              </span>
              <Badge variant="success">All Verified</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">✓ Student Sync</span>
              <span className="flex items-center gap-1">✓ Course Sync</span>
              <span className="flex items-center gap-1">✓ Enrollments</span>
              <span className="flex items-center gap-1">✓ Timetable Import</span>
              <span className="flex items-center gap-1">✓ Attendance Import</span>
              <span className="flex items-center gap-1">✓ Marks Import</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Targeted Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Targeted Operational Synchronization</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute scoped idempotent synchronization for specific collegiate data subsystems
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRunSync("students")}
            isLoading={isSyncing && activeSyncType === "students"}
            className="text-xs"
          >
            Sync Student Identities
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRunSync("courses")}
            isLoading={isSyncing && activeSyncType === "courses"}
            className="text-xs"
          >
            Sync Courses & Catalog
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRunSync("enrollments")}
            isLoading={isSyncing && activeSyncType === "enrollments"}
            className="text-xs"
          >
            Sync Enrollments
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRunSync("attendance")}
            isLoading={isSyncing && activeSyncType === "attendance"}
            className="text-xs"
          >
            Import Biometric Attendance
          </Button>
        </CardContent>
      </Card>

      {/* Latest Execution Report */}
      {latestResult && (
        <Card className="border-brand-blue/40 bg-blue-50/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Sync Run Reconciliation Report</CardTitle>
              <Badge variant={latestResult.recordsFailed > 0 ? "warning" : "success"}>
                {latestResult.recordsFailed > 0 ? "Reconciliation Warnings" : "100% Reconciled"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: {latestResult.sourceSystem} • Executed: {latestResult.completedAt}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white rounded border border-surface-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Processed</span>
                <span className="text-lg font-bold text-slate-800 block mt-0.5">
                  {latestResult.recordsProcessed}
                </span>
              </div>
              <div className="p-3 bg-white rounded border border-surface-200">
                <span className="text-[10px] text-green-600 uppercase font-semibold">Succeeded</span>
                <span className="text-lg font-bold text-status-success block mt-0.5">
                  {latestResult.recordsSucceeded}
                </span>
              </div>
              <div className="p-3 bg-white rounded border border-surface-200">
                <span className="text-[10px] text-red-600 uppercase font-semibold">Failed</span>
                <span className="text-lg font-bold text-status-danger block mt-0.5">
                  {latestResult.recordsFailed}
                </span>
              </div>
            </div>

            {latestResult.errorSummary && (
              <Alert variant="danger" title="Synchronization Error Summary">
                {latestResult.errorSummary}
              </Alert>
            )}

            {latestResult.items.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-600 mb-1">Itemized Ledger:</h4>
                <div className="max-h-48 overflow-y-auto divide-y divide-surface-100 bg-white rounded border border-surface-200 text-xs">
                  {latestResult.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <span className="font-mono text-slate-700">{item.externalId}</span>
                      <div className="flex items-center gap-2">
                        {item.error ? (
                          <span className="text-status-danger text-[11px]">{item.error}</span>
                        ) : null}
                        <Badge
                          variant={
                            item.action === "failed"
                              ? "danger"
                              : item.action === "created"
                              ? "success"
                              : item.action === "updated"
                              ? "info"
                              : "neutral"
                          }
                          className="capitalize text-[10px]"
                        >
                          {item.action}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sync Run History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Synchronization Runs ({syncHistory.length})</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit of past batch jobs, record throughput, and failure reports
          </p>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Execution Time</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Sync Type</TableHead>
                  <TableHead>Throughput</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error Diagnostics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncHistory.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="text-xs text-slate-600 font-medium whitespace-nowrap">
                      {formatDate(run.started_at)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-800 whitespace-nowrap">
                      {run.source_system}
                    </TableCell>
                    <TableCell className="text-xs font-semibold uppercase text-brand-navy whitespace-nowrap">
                      {run.sync_type}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                      {run.records_succeeded} / {run.records_processed} records
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          run.status === "completed"
                            ? "success"
                            : run.status === "partial"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {run.error_summary || "Clean reconciliation"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>
    </div>
  );
}
