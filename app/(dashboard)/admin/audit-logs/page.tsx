"use client";

import React, { useState, useMemo } from "react";
import { mockAuditLogs } from "@/lib/mock-data";
import { AuditLog } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { History, Search, ShieldCheck, Lock } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actorName = log.actor?.full_name || "System";
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = actionFilter === "all" ? true : log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Institutional Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only security logs tracking privileged grading, attendance, and role provisioning events
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 border border-green-200 text-status-success text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Tamper-Evident Ledger
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by action, actor, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs py-1.5 h-9"
            >
              <option value="all">All Privileged Actions</option>
              <option value="MARKS_PUBLISHED">MARKS_PUBLISHED</option>
              <option value="MARKS_UNPUBLISHED">MARKS_UNPUBLISHED</option>
              <option value="ATTENDANCE_CORRECTED">ATTENDANCE_CORRECTED</option>
              <option value="EXEMPTION_APPROVED">EXEMPTION_APPROVED</option>
              <option value="EXEMPTION_REJECTED">EXEMPTION_REJECTED</option>
              <option value="ROLE_PROVISIONED">ROLE_PROVISIONED</option>
              <option value="USER_ACTIVATED">USER_ACTIVATED</option>
              <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recorded System Events ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor / Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Affected</TableHead>
                  <TableHead>Change Details / Diff</TableHead>
                  <TableHead>Client IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No audit events match the specified filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-slate-600 font-mono whitespace-nowrap">
                        {log.created_at.replace("T", " ").substring(0, 19)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-semibold text-xs text-brand-navy">
                          {log.actor?.full_name || "System Automation"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.actor?.college_id || "SYS"}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="primary" className="font-mono text-[11px]">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-700 whitespace-nowrap">
                        {log.entity_type} {log.entity_id ? `[${log.entity_id.substring(0, 8)}]` : ""}
                      </TableCell>
                      <TableCell className="text-xs max-w-sm">
                        <div className="font-mono text-[10px] bg-surface-100 p-2 rounded border border-surface-200 overflow-x-auto">
                          {log.new_values ? (
                            <span>{JSON.stringify(log.new_values)}</span>
                          ) : (
                            <span className="text-slate-400">No delta data</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {log.ip_address || "127.0.0.1"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>
    </div>
  );
}
