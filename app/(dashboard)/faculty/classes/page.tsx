"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockCourseOfferings,
  mockEnrollments,
  mockProfiles,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { Users, Mail, Phone, BookOpen, ShieldCheck } from "lucide-react";

export default function FacultyClassesPage() {
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

  const currentOffering = useMemo(() => {
    return assignedOfferings.find((o) => o.id === selectedOfferingId);
  }, [assignedOfferings, selectedOfferingId]);

  // Enrolled students for selected offering
  const roster = useMemo(() => {
    if (!selectedOfferingId) return [];
    const enrollments = mockEnrollments.filter(
      (e) => e.course_offering_id === selectedOfferingId && e.status === "enrolled"
    );

    return enrollments.map((e) => {
      const studentProfile = mockProfiles.find((p) => p.id === e.student_id);
      return {
        enrollmentId: e.id,
        studentId: e.student_id,
        collegeId: studentProfile?.college_id || "STU-N/A",
        fullName: studentProfile?.full_name || "Unknown Student",
        email: studentProfile?.email || "n/a@student.campusone.edu",
        semester: studentProfile?.semester || 6,
        section: studentProfile?.section || "A",
        phone: studentProfile?.phone || "N/A",
        enrolledAt: e.enrolled_at,
        status: e.status,
      };
    });
  }, [selectedOfferingId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Assigned Classes & Student Rosters</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized student directories for your assigned course offerings
          </p>
        </div>

        {/* Offering selector */}
        <div className="w-72">
          <Select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className="text-xs"
          >
            {assignedOfferings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.course?.code}: {o.course?.title} (Sec {o.section})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Class Meta Card */}
      {currentOffering && (
        <Card className="bg-surface-50/50">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">{currentOffering.course?.code}</Badge>
                <h2 className="text-base font-bold text-slate-900">
                  {currentOffering.course?.title}
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                {currentOffering.course?.description}
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Enrolled</span>
                <span className="font-bold text-sm text-brand-navy">{roster.length}</span> / {currentOffering.capacity}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Section</span>
                <span className="font-bold text-sm text-brand-navy">{currentOffering.section}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Credits</span>
                <span className="font-bold text-sm text-brand-navy">{currentOffering.course?.credits}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Roster Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Course Enrollment Roster</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified students officially enrolled in Section {currentOffering?.section}
            </p>
          </div>
          <Badge variant="success">Official Roster</Badge>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll / College ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Institutional Email</TableHead>
                  <TableHead>Semester / Sec</TableHead>
                  <TableHead>Emergency Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No enrolled students found for this course offering.
                    </TableCell>
                  </TableRow>
                ) : (
                  roster.map((student) => (
                    <TableRow key={student.enrollmentId}>
                      <TableCell className="font-semibold text-xs text-brand-navy whitespace-nowrap">
                        {student.collegeId}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-slate-800 whitespace-nowrap">
                        {student.fullName}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        Sem {student.semester} - {student.section}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {student.phone}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="success">Enrolled</Badge>
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
