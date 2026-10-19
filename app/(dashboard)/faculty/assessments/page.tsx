"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockCourseOfferings,
  mockAssessments,
  mockAssessmentScores,
  mockEnrollments,
  mockProfiles,
  mockAuditLogs,
} from "@/lib/mock-data";
import { Assessment, AssessmentScore, AssessmentType } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import {
  FileSpreadsheet,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Lock,
} from "lucide-react";

export default function FacultyAssessmentsPage() {
  const { user } = useAuth();

  // Assigned course offerings
  const assignedOfferings = useMemo(() => {
    return mockCourseOfferings.filter(
      (o) => o.faculty_id === user?.id || user?.role === "admin"
    );
  }, [user?.id, user?.role]);

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    assignedOfferings[0]?.id || ""
  );

  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const [scores, setScores] = useState<AssessmentScore[]>(mockAssessmentScores);

  // Filter assessments for selected offering
  const offeringAssessments = useMemo(() => {
    return assessments.filter((a) => a.course_offering_id === selectedOfferingId);
  }, [assessments, selectedOfferingId]);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    offeringAssessments[0]?.id || ""
  );

  const currentAssessment = useMemo(() => {
    return assessments.find((a) => a.id === selectedAssessmentId);
  }, [assessments, selectedAssessmentId]);

  // Enrolled students for selected offering
  const enrolledStudents = useMemo(() => {
    if (!selectedOfferingId) return [];
    const enrollments = mockEnrollments.filter(
      (e) => e.course_offering_id === selectedOfferingId && e.status === "enrolled"
    );
    return enrollments.map((e) => mockProfiles.find((p) => p.id === e.student_id)!);
  }, [selectedOfferingId]);

  // Marks state: studentId -> marks
  const [marksState, setMarksState] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const sc of mockAssessmentScores) {
      if (sc.assessment_id === selectedAssessmentId) {
        initial[sc.student_id] = sc.marks_obtained;
      }
    }
    return initial;
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New assessment form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<AssessmentType>("quiz");
  const [newMaxMarks, setNewMaxMarks] = useState(25);
  const [newWeightage, setNewWeightage] = useState(15);
  const [newDueDate, setNewDueDate] = useState("2026-11-05");

  const handleAssessmentSelect = (id: string) => {
    setSelectedAssessmentId(id);
    const newMarks: Record<string, number> = {};
    for (const sc of scores) {
      if (sc.assessment_id === id) {
        newMarks[sc.student_id] = sc.marks_obtained;
      }
    }
    setMarksState(newMarks);
    setSuccessMessage(null);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newMaxMarks <= 0) {
      setFormError("Maximum marks must be greater than 0");
      return;
    }

    const created: Assessment = {
      id: `asm-${Date.now()}`,
      course_offering_id: selectedOfferingId,
      title: newTitle.trim(),
      assessment_type: newType,
      max_marks: Number(newMaxMarks),
      weightage: Number(newWeightage),
      due_date: newDueDate ? `${newDueDate}T23:59:59Z` : null,
      is_published: false,
      published_at: null,
      created_by: user?.id || "f0000000-0000-0000-0000-000000000001",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setAssessments([created, ...assessments]);
    setSelectedAssessmentId(created.id);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setSuccessMessage(`Assessment "${created.title}" created as Draft. You can now enter student marks.`);
  };

  const handleSaveMarks = () => {
    // Validate bounds
    const maxMarks = currentAssessment?.max_marks || 100;
    for (const s of enrolledStudents) {
      const val = marksState[s.id];
      if (val !== undefined && (val < 0 || val > maxMarks)) {
        setFormError(`Marks for ${s.full_name} (${val}) cannot exceed maximum allowed of ${maxMarks}`);
        return;
      }
    }

    // Save
    const updatedScores = [...scores];
    for (const s of enrolledStudents) {
      const marksVal = marksState[s.id] ?? 0;
      const existingIdx = updatedScores.findIndex(
        (sc) => sc.assessment_id === selectedAssessmentId && sc.student_id === s.id
      );

      if (existingIdx >= 0) {
        updatedScores[existingIdx] = {
          ...updatedScores[existingIdx],
          marks_obtained: marksVal,
          graded_at: new Date().toISOString(),
        };
      } else {
        updatedScores.push({
          id: `sc-${Date.now()}-${s.id}`,
          assessment_id: selectedAssessmentId,
          student_id: s.id,
          marks_obtained: marksVal,
          remarks: "Graded via CampusOne portal",
          graded_by: user?.id || "f0000000-0000-0000-0000-000000000001",
          graded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    setScores(updatedScores);
    setFormError(null);
    setSuccessMessage("Student evaluation marks successfully recorded.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleTogglePublish = () => {
    if (!currentAssessment) return;
    const willPublish = !currentAssessment.is_published;

    setAssessments((prev) =>
      prev.map((a) =>
        a.id === currentAssessment.id
          ? {
              ...a,
              is_published: willPublish,
              published_at: willPublish ? new Date().toISOString() : null,
            }
          : a
      )
    );

    // Record audit log
    mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor_id: user?.id || null,
      actor: user || undefined,
      action: willPublish ? "MARKS_PUBLISHED" : "MARKS_UNPUBLISHED",
      entity_type: "assessment",
      entity_id: currentAssessment.id,
      old_values: { is_published: currentAssessment.is_published },
      new_values: { is_published: willPublish },
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    });

    setIsPublishModalOpen(false);
    setSuccessMessage(
      willPublish
        ? `Marks officially published! Students can now view their individual grades.`
        : `Assessment reverted to Draft. Scores are now hidden from students.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Assessments & Marks Entry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create evaluations, grade student submissions, and officially publish results
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedOfferingId}
            onChange={(e) => {
              setSelectedOfferingId(e.target.value);
              const firstAsm = assessments.find((a) => a.course_offering_id === e.target.value);
              if (firstAsm) handleAssessmentSelect(firstAsm.id);
            }}
            className="text-xs py-1.5 h-9 w-52"
          >
            {assignedOfferings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.course?.code} (Sec {o.section})
              </option>
            ))}
          </Select>

          <Button
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            New Assessment
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" title="Evaluation Updated">
          {successMessage}
        </Alert>
      )}

      {formError && (
        <Alert variant="danger" title="Validation Error">
          {formError}
        </Alert>
      )}

      {/* Assessment Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {offeringAssessments.map((a) => (
          <button
            key={a.id}
            onClick={() => handleAssessmentSelect(a.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
              a.id === selectedAssessmentId
                ? "bg-brand-navy text-white border-brand-navy shadow-sm"
                : "bg-white text-slate-700 border-surface-200 hover:border-brand-blue"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span>{a.title}</span>
              <Badge variant={a.is_published ? "success" : "neutral"} className="text-[10px]">
                {a.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* Active Assessment Controls Card */}
      {currentAssessment ? (
        <Card className="bg-white">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={currentAssessment.is_published ? "success" : "neutral"}>
                  {currentAssessment.is_published ? "PUBLISHED TO STUDENTS" : "DRAFT (HIDDEN)"}
                </Badge>
                <h3 className="text-base font-bold text-slate-900">
                  {currentAssessment.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Max Marks: <strong className="text-slate-800">{currentAssessment.max_marks}</strong> • Weightage:{" "}
                <strong className="text-slate-800">{currentAssessment.weightage || 0}%</strong> • Type:{" "}
                <span className="capitalize">{currentAssessment.assessment_type}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={currentAssessment.is_published ? "outline" : "secondary"}
                size="sm"
                onClick={() => setIsPublishModalOpen(true)}
                className="text-xs"
              >
                {currentAssessment.is_published ? (
                  <>
                    <Lock className="h-4 w-4 mr-1.5" />
                    Unpublish Marks
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-1.5" />
                    Publish to Students
                  </>
                )}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveMarks}
                className="text-xs"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save Marks Sheet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-xs text-slate-400">
            No assessments created yet for this course. Click &quot;New Assessment&quot; to begin.
          </CardContent>
        </Card>
      )}

      {/* Grading Sheet Table */}
      {currentAssessment && (
        <Card>
          <CardHeader>
            <CardTitle>Grading & Scores Sheet</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter marks obtained for each student (0 to {currentAssessment.max_marks})
            </p>
          </CardHeader>
          <CardContent>
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll / ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks (Max: {currentAssessment.max_marks})</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Performance Tag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.map((student) => {
                    const currentMarks = marksState[student.id] ?? 0;
                    const max = currentAssessment.max_marks;
                    const pct = Math.round((currentMarks / max) * 100);

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-semibold text-xs text-brand-navy whitespace-nowrap">
                          {student.college_id}
                        </TableCell>
                        <TableCell className="font-medium text-xs text-slate-800 whitespace-nowrap">
                          {student.full_name}
                        </TableCell>
                        <TableCell className="w-48">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={max}
                              step="0.5"
                              value={currentMarks}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setMarksState({ ...marksState, [student.id]: val });
                              }}
                              className="text-xs py-1 h-8 w-24 text-right font-bold"
                            />
                            <span className="text-xs text-slate-400">/ {max}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs font-bold text-slate-700">
                          {pct}%
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {pct >= 85 ? (
                            <Badge variant="success">Outstanding</Badge>
                          ) : pct >= 70 ? (
                            <Badge variant="info">Proficient</Badge>
                          ) : pct >= 50 ? (
                            <Badge variant="warning">Satisfactory</Badge>
                          ) : (
                            <Badge variant="danger">Needs Attention</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      )}

      {/* Create Assessment Dialog */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Academic Assessment"
        description="Define an assessment component for your assigned course offering."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assessment Title <span className="text-status-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Quiz 3: Dynamic Programming"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type
              </label>
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value as AssessmentType)}
                className="text-xs"
              >
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
                <option value="midterm">Midterm Exam</option>
                <option value="final">Final Exam</option>
                <option value="project">Project / Lab</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Marks <span className="text-status-danger">*</span>
              </label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(parseInt(e.target.value, 10))}
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weightage (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newWeightage}
                onChange={(e) => setNewWeightage(parseInt(e.target.value, 10))}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Assessment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={
          currentAssessment?.is_published
            ? "Confirm Unpublishing Assessment"
            : "Confirm Publishing Official Marks"
        }
        description="Requires faculty confirmation before student view states are modified."
        maxWidth="sm"
      >
        <p className="text-xs text-slate-600 leading-relaxed py-2">
          {currentAssessment?.is_published
            ? `Are you sure you want to revert "${currentAssessment?.title}" to Draft? Students will temporarily lose access to their marks.`
            : `Are you ready to officially publish marks for "${currentAssessment?.title}"? All enrolled students will be immediately notified and able to inspect their scores.`}
        </p>

        <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPublishModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={currentAssessment?.is_published ? "danger" : "primary"}
            size="sm"
            onClick={handleTogglePublish}
          >
            {currentAssessment?.is_published ? "Yes, Unpublish" : "Yes, Publish Scores"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
