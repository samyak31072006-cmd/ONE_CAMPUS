"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockAssessments,
  mockAssessmentScores,
  mockCourseOfferings,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { FileSpreadsheet, Lock, CheckCircle2, TrendingUp, Award } from "lucide-react";

export default function StudentAssessmentsPage() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const studentOfferings = useMemo(() => {
    return mockCourseOfferings.slice(0, 3);
  }, []);

  // Filter ONLY published assessments for enrolled courses
  // Ensure strict isolation: score query is strictly filtered by student_id = user.id AND assessment.is_published = true
  const authorizedScores = useMemo(() => {
    const publishedAssessments = mockAssessments.filter((a) => a.is_published);
    const publishedAssessmentMap = new Map(publishedAssessments.map((a) => [a.id, a]));

    // Only current student's scores
    const myScores = mockAssessmentScores.filter(
      (s) => s.student_id === user?.id && publishedAssessmentMap.has(s.assessment_id)
    );

    return myScores
      .map((score) => {
        const assessment = publishedAssessmentMap.get(score.assessment_id)!;
        const offering = studentOfferings.find((o) => o.id === assessment.course_offering_id);

        return {
          id: score.id,
          courseOfferingId: assessment.course_offering_id,
          courseCode: offering?.course?.code || "CS",
          courseTitle: offering?.course?.title || "Course",
          assessmentTitle: assessment.title,
          assessmentType: assessment.assessment_type,
          dueDate: assessment.due_date,
          publishedAt: assessment.published_at,
          marksObtained: score.marks_obtained,
          maxMarks: assessment.max_marks,
          percentage: Math.round((score.marks_obtained / assessment.max_marks) * 1000) / 10,
          weightage: assessment.weightage,
          remarks: score.remarks,
        };
      })
      .filter((item) => {
        if (selectedSubject === "all") return true;
        return item.courseOfferingId === selectedSubject;
      })
      .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  }, [user?.id, studentOfferings, selectedSubject]);

  // Aggregate statistics
  const stats = useMemo(() => {
    if (authorizedScores.length === 0) {
      return { count: 0, average: 0, highest: 0, totalMarks: 0, maxPossible: 0 };
    }
    const totalMarks = authorizedScores.reduce((acc, s) => acc + s.marksObtained, 0);
    const maxPossible = authorizedScores.reduce((acc, s) => acc + s.maxMarks, 0);
    const avg = Math.round((totalMarks / maxPossible) * 1000) / 10;
    const highest = Math.max(...authorizedScores.map((s) => s.percentage));

    return {
      count: authorizedScores.length,
      average: avg,
      highest,
      totalMarks: Math.round(totalMarks * 10) / 10,
      maxPossible,
    };
  }, [authorizedScores]);

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Academic Assessments & Quizzes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Officially published scores, quizzes, and academic evaluations
          </p>
        </div>

        <div className="w-56">
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs py-1.5 h-9"
          >
            <option value="all">All Enrolled Subjects</option>
            {studentOfferings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.course?.code} - {o.course?.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Aggregate Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Academic Average
            </span>
            <div className="mt-2 text-3xl font-extrabold text-brand-navy">
              {stats.average}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.totalMarks} / {stats.maxPossible} points accumulated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Highest Evaluation
            </span>
            <div className="mt-2 text-3xl font-extrabold text-status-success">
              {stats.highest}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Top recorded score in term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Evaluations Graded
            </span>
            <div className="mt-2 text-3xl font-extrabold text-brand-blue">
              {stats.count}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Quizzes & Assignments completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Score Privacy
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Lock className="h-4 w-4 text-brand-navy" />
              Isolated Record
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Peer scores strictly concealed by RLS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Published Academic Grades</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Only approved and published grades released by course faculty
          </p>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Assessment Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Marks Obtained</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Weightage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Faculty Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorizedScores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      No published assessments found for this selection.
                    </TableCell>
                  </TableRow>
                ) : (
                  authorizedScores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell className="whitespace-nowrap font-medium text-xs">
                        <Badge variant="primary">{score.courseCode}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">
                        {score.assessmentTitle}
                      </TableCell>
                      <TableCell className="whitespace-nowrap capitalize text-xs text-slate-600">
                        {score.assessmentType}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-bold text-sm text-brand-navy">
                        {score.marksObtained} <span className="text-xs font-normal text-slate-400">/ {score.maxMarks}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`font-bold text-xs ${
                            score.percentage >= 75
                              ? "text-status-success"
                              : score.percentage >= 60
                              ? "text-brand-blue"
                              : "text-status-warning"
                          }`}
                        >
                          {score.percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-500">
                        {score.weightage ? `${score.weightage}%` : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="success">Published</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs italic">
                        {score.remarks || "—"}
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
