"use client";

import React, { useState, useMemo } from "react";
import {
  mockExemptionRequests,
  mockExemptionReviews,
  mockClassSessions,
  mockCourseOfferings,
} from "@/lib/mock-data";
import { ExemptionStatus } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminExemptionsPage() {
  const [requests] = useState(mockExemptionRequests);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter === "all") return true;
      return r.status === statusFilter;
    });
  }, [requests, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Collegiate Exemption Oversight</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional supervisory monitor for all student absence exemptions and departmental decisions
          </p>
        </div>

        <div className="w-52">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 h-9"
          >
            <option value="all">All Application Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collegiate Exemption Applications ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course & Session Date</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead>Supporting Evidence</TableHead>
                  <TableHead>Decision Status</TableHead>
                  <TableHead>Reviewer Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => {
                  const session = mockClassSessions.find((s) => s.id === req.class_session_id);
                  const offering = mockCourseOfferings.find((o) => o.id === session?.course_offering_id);
                  const review = mockExemptionReviews.find((r) => r.exemption_request_id === req.id);

                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-semibold text-xs text-brand-navy whitespace-nowrap">
                        <div>{req.student?.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{req.student?.college_id}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-800 whitespace-nowrap">
                        <Badge variant="primary" className="mr-1.5">{offering?.course?.code}</Badge>
                        {session?.session_date ? formatDate(session.session_date) : "N/A"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 max-w-xs">
                        <p className="line-clamp-2">{req.reason}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-brand-blue font-medium">
                        {req.document_filename ? (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {req.document_filename}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {req.status === "approved" && <Badge variant="success">Approved</Badge>}
                        {req.status === "rejected" && <Badge variant="danger">Rejected</Badge>}
                        {req.status === "pending" && <Badge variant="info">Pending</Badge>}
                        {req.status === "cancelled" && <Badge variant="neutral">Cancelled</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs italic">
                        {review?.comments || "Pending review"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>
    </div>
  );
}
