"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockClassSessions,
  mockCourseOfferings,
  mockExemptionRequests,
  mockExemptionReviews,
} from "@/lib/mock-data";
import { ExemptionRequest, ExemptionStatus } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate, formatTime } from "@/lib/utils";
import {
  FileQuestion,
  PlusCircle,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  AlertCircle,
  Trash2,
} from "lucide-react";

export default function StudentExemptionsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ExemptionRequest[]>(mockExemptionRequests);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form states
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Student's requests
  const myRequests = useMemo(() => {
    return requests.filter((r) => r.student_id === user?.id);
  }, [requests, user?.id]);

  // Eligible sessions to request exemption for (sessions for enrolled courses where status != cancelled)
  const eligibleSessions = useMemo(() => {
    const existingSessionIds = new Set(myRequests.map((r) => r.class_session_id));
    return mockClassSessions.filter(
      (s) => s.status !== "cancelled" && !existingSessionIds.has(s.id)
    );
  }, [myRequests]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size exceeds 10MB limit");
      return;
    }

    // Validate mime type
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setFileError("Only PDF or image documents (JPG, PNG, WebP) are accepted");
      return;
    }

    setFileName(file.name);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedSessionId) {
      setFormError("Please select a valid class session");
      return;
    }
    if (reason.trim().length < 10) {
      setFormError("Reason must be at least 10 characters explaining your absence");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedSession = mockClassSessions.find((s) => s.id === selectedSessionId);
      const newRequest: ExemptionRequest = {
        id: `ex-${Date.now()}`,
        student_id: user?.id || "s0000000-0000-0000-0000-000000000001",
        student: user || undefined,
        class_session_id: selectedSessionId,
        class_session: selectedSession,
        reason: reason.trim(),
        document_url: fileName
          ? `exemption-documents/${user?.id || "student"}/${fileName}`
          : null,
        document_filename: fileName || null,
        status: "pending",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setRequests([newRequest, ...requests]);
      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
      setSelectedSessionId("");
      setReason("");
      setFileName("");
      setNotification("Exemption request submitted successfully and queued for review.");
    }, 400);
  };

  // Cancel request (permitted only if status === 'pending')
  const handleCancelRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId && r.status === "pending") {
          return { ...r, status: "cancelled", updated_at: new Date().toISOString() };
        }
        return r;
      })
    );
    setNotification("Pending exemption request has been cancelled.");
  };

  const getStatusBadge = (status: ExemptionStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      case "under_review":
        return <Badge variant="warning">Under Review</Badge>;
      case "cancelled":
        return <Badge variant="neutral">Cancelled</Badge>;
      case "pending":
      default:
        return <Badge variant="info">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Attendance Exemption Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit medical or approved college duty certificates to excuse class absences
          </p>
        </div>

        <Button
          onClick={() => {
            setNotification(null);
            setIsSubmitModalOpen(true);
          }}
          className="self-start sm:self-auto"
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-1.5" />
          New Exemption Request
        </Button>
      </div>

      {notification && (
        <Alert variant="success" title="Request Updated">
          {notification}
        </Alert>
      )}

      {/* Info Notice */}
      <Alert variant="info" title="Private Document Guidelines">
        Supporting medical certificates, participation letters, or Dean approval forms are securely stored in private document storage. Authorized faculty and administrative reviewers verify documents before approving exemptions.
      </Alert>

      {/* Exemption Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>My Exemption Applications</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status tracking, faculty review feedback, and document verification
          </p>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Class Session</TableHead>
                  <TableHead>Reason for Absence</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Review Status</TableHead>
                  <TableHead>Decision Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No exemption requests on record.
                    </TableCell>
                  </TableRow>
                ) : (
                  myRequests.map((req) => {
                    const session = req.class_session;
                    const offering = mockCourseOfferings.find(
                      (o) => o.id === session?.course_offering_id
                    );
                    const review = mockExemptionReviews.find(
                      (rev) => rev.exemption_request_id === req.id
                    );

                    return (
                      <TableRow key={req.id}>
                        <TableCell className="whitespace-nowrap text-xs text-slate-600 font-medium">
                          {formatDate(req.submitted_at)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-semibold text-xs text-brand-navy">
                            {offering?.course?.code || "Course"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {session?.session_date ? formatDate(session.session_date) : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-800 max-w-xs">
                          <p className="line-clamp-2">{req.reason}</p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {req.document_filename ? (
                            <div className="flex items-center gap-1.5 text-xs text-brand-blue font-medium">
                              <FileText className="h-4 w-4" />
                              <span className="truncate max-w-[120px]" title={req.document_filename}>
                                {req.document_filename}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">None attached</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getStatusBadge(req.status)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-xs italic">
                          {review?.comments || "Pending departmental examination"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {req.status === "pending" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelRequest(req.id)}
                              className="text-status-danger hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
                              title="Cancel this pending request"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
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

      {/* Exemption Submission Modal */}
      <Dialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Absence Exemption Request"
        description="Select the missed lecture session and provide formal justification."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-status-dangerBg text-status-dangerText">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Missed Session <span className="text-status-danger">*</span>
            </label>
            <Select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="text-xs"
              required
            >
              <option value="">-- Choose Eligible Lecture --</option>
              {eligibleSessions.map((session) => {
                const offering = mockCourseOfferings.find(
                  (o) => o.id === session.course_offering_id
                );
                return (
                  <option key={session.id} value={session.id}>
                    {offering?.course?.code} ({formatDate(session.session_date)} {formatTime(session.start_time)}) - {session.topic || "Lecture"}
                  </option>
                );
              })}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Reason / Justification <span className="text-status-danger">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain the circumstance (medical emergency, collegiate representation, bereavement)..."
              className="w-full rounded-md border border-surface-300 p-2 text-xs text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supporting Documentation (PDF or Image, max 10MB)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-surface-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-surface-100 transition-colors">
                <Upload className="h-4 w-4 mr-1.5 text-brand-blue" />
                Select Document
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </label>
              {fileName && (
                <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
                  {fileName}
                </span>
              )}
            </div>
            {fileError && <p className="text-xs text-status-danger mt-1">{fileError}</p>}
            <p className="text-[11px] text-slate-500 mt-1">
              Uploaded files are stored in an encrypted private bucket accessible only to reviewers.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Submit for Verification
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
