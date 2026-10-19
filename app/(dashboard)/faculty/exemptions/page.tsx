"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockCourseOfferings,
  mockClassSessions,
  mockExemptionRequests,
  mockExemptionReviews,
  mockAuditLogs,
} from "@/lib/mock-data";
import { ExemptionRequest, ExemptionReview, ExemptionStatus } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate, formatTime } from "@/lib/utils";
import {
  FileQuestion,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  AlertTriangle,
  History,
  ExternalLink,
} from "lucide-react";

export default function FacultyExemptionsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ExemptionRequest[]>(mockExemptionRequests);
  const [reviews, setReviews] = useState<ExemptionReview[]>(mockExemptionReviews);

  const [activeRequest, setActiveRequest] = useState<ExemptionRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved");
  const [comments, setComments] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter requests for classes taught by this faculty member
  const facultyRequests = useMemo(() => {
    return requests.filter((r) => {
      const session = mockClassSessions.find((s) => s.id === r.class_session_id);
      const offering = mockCourseOfferings.find((o) => o.id === session?.course_offering_id);
      return offering?.faculty_id === user?.id || user?.role === "admin";
    });
  }, [requests, user?.id, user?.role]);

  const handleOpenReview = (request: ExemptionRequest, action: "approved" | "rejected") => {
    setActiveRequest(request);
    setReviewAction(action);
    setComments("");
    setCommentError(null);
  };

  const handleExecuteReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (comments.trim().length < 5) {
      setCommentError("A substantive review comment (min 5 characters) is required for audit compliance.");
      return;
    }

    if (!activeRequest) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newReview: ExemptionReview = {
        id: `rev-${Date.now()}`,
        exemption_request_id: activeRequest.id,
        reviewer_id: user?.id || "f0000000-0000-0000-0000-000000000001",
        reviewer: user || undefined,
        action: reviewAction,
        comments: comments.trim(),
        created_at: new Date().toISOString(),
      };

      setReviews([newReview, ...reviews]);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === activeRequest.id
            ? { ...r, status: reviewAction, updated_at: new Date().toISOString() }
            : r
        )
      );

      // Audit log entry
      mockAuditLogs.unshift({
        id: `aud-${Date.now()}`,
        actor_id: user?.id || null,
        actor: user || undefined,
        action: reviewAction === "approved" ? "EXEMPTION_APPROVED" : "EXEMPTION_REJECTED",
        entity_type: "exemption_request",
        entity_id: activeRequest.id,
        old_values: { status: activeRequest.status },
        new_values: { status: reviewAction, comments: comments.trim() },
        ip_address: "127.0.0.1",
        created_at: new Date().toISOString(),
      });

      setIsSubmitting(false);
      setActiveRequest(null);
      setNotification(
        `Exemption request for ${activeRequest.student?.full_name} has been ${reviewAction.toUpperCase()} and sealed in audit log.`
      );
      setTimeout(() => setNotification(null), 5000);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Exemption Verification Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review student absence appeals and medical documentation for your assigned courses
          </p>
        </div>
      </div>

      {notification && (
        <Alert variant="success" title="Decision Recorded">
          {notification}
        </Alert>
      )}

      {/* Exemption Review Table */}
      <Card>
        <CardHeader>
          <CardTitle>Absence Exemption Requests</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Student applications with private document links and verification controls
          </p>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Session & Date</TableHead>
                  <TableHead>Stated Reason</TableHead>
                  <TableHead>Attached Evidence</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Review Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No exemption requests queued for your assigned courses.
                    </TableCell>
                  </TableRow>
                ) : (
                  facultyRequests.map((req) => {
                    const session = mockClassSessions.find((s) => s.id === req.class_session_id);
                    const offering = mockCourseOfferings.find((o) => o.id === session?.course_offering_id);
                    const review = reviews.find((rev) => rev.exemption_request_id === req.id);

                    return (
                      <TableRow key={req.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-semibold text-xs text-brand-navy">
                            {req.student?.full_name || "Arjun Mehta"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {req.student?.college_id || "STU2024001"}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium text-xs text-slate-800">
                            {offering?.course?.code}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {session?.session_date ? formatDate(session.session_date) : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 max-w-xs">
                          <p className="line-clamp-2">{req.reason}</p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {req.document_filename ? (
                            <a
                              href={`#download-${req.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`Simulating secure signed URL retrieval (expires in 60s) for private file: ${req.document_filename}`);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs text-brand-blue font-medium hover:underline bg-blue-50 px-2.5 py-1 rounded border border-brand-blue/20"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]">{req.document_filename}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">None attached</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {req.status === "approved" && <Badge variant="success">Approved</Badge>}
                          {req.status === "rejected" && <Badge variant="danger">Rejected</Badge>}
                          {req.status === "under_review" && <Badge variant="warning">Under Review</Badge>}
                          {req.status === "pending" && <Badge variant="info">Pending Review</Badge>}
                          {req.status === "cancelled" && <Badge variant="neutral">Cancelled</Badge>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {req.status === "pending" || req.status === "under_review" ? (
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenReview(req, "approved")}
                                className="text-xs h-7 px-2.5 bg-status-success hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReview(req, "rejected")}
                                className="text-xs h-7 px-2.5 text-status-danger border-status-danger/30 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-slate-800">Decided</p>
                              {review && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[140px]" title={review.comments || ""}>
                                  &quot;{review.comments}&quot;
                                </p>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>

      {/* Review Decision Dialog */}
      <Dialog
        isOpen={!!activeRequest}
        onClose={() => setActiveRequest(null)}
        title={
          reviewAction === "approved"
            ? "Approve Attendance Exemption"
            : "Reject Attendance Exemption"
        }
        description="Provide a formal evaluation comment. This comment will be logged in the audit trail and visible to the student."
        maxWidth="md"
      >
        <form onSubmit={handleExecuteReview} className="space-y-4">
          {commentError && (
            <div className="p-2.5 rounded bg-status-dangerBg text-status-dangerText text-xs">
              {commentError}
            </div>
          )}

          <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 text-xs space-y-1">
            <p>
              Student: <strong className="text-slate-900">{activeRequest?.student?.full_name}</strong>
            </p>
            <p>
              Reason: <span className="text-slate-600 italic">&quot;{activeRequest?.reason}&quot;</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decision Comments / Justification <span className="text-status-danger">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder={
                reviewAction === "approved"
                  ? "e.g. Verified valid hospital certificate. Granted attendance credit as excused."
                  : "e.g. Documentation unverified or does not meet minimum collegiate criteria."
              }
              className="w-full text-xs rounded border border-surface-300 p-2 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveRequest(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewAction === "approved" ? "primary" : "danger"}
              size="sm"
              isLoading={isSubmitting}
            >
              Confirm {reviewAction === "approved" ? "Approval" : "Rejection"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
