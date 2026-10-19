"use client";

import React, { useState } from "react";
import {
  mockDepartments,
  mockAcademicTerms,
  mockCourses,
  mockCourseOfferings,
  mockEnrollments,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, Building2, Layers, PlusCircle } from "lucide-react";

export default function AdminAcademicsPage() {
  const [departments] = useState(mockDepartments);
  const [terms] = useState(mockAcademicTerms);
  const [courses] = useState(mockCourses);
  const [offerings] = useState(mockCourseOfferings);
  const [enrollments] = useState(mockEnrollments);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Academics Architecture</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure collegiate departments, academic terms, courses, course offerings, and student enrollments
          </p>
        </div>
      </div>

      <Tabs defaultValue="offerings">
        <TabsList>
          <TabsTrigger value="offerings">Course Offerings ({offerings.length})</TabsTrigger>
          <TabsTrigger value="courses">Master Catalog ({courses.length})</TabsTrigger>
          <TabsTrigger value="terms">Academic Terms ({terms.length})</TabsTrigger>
          <TabsTrigger value="departments">Departments ({departments.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Course Offerings */}
        <TabsContent value="offerings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Course Offerings</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Term offerings linking courses, assigned faculty, sections, and student capacities
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code & Title</TableHead>
                      <TableHead>Academic Term</TableHead>
                      <TableHead>Assigned Faculty</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Offering Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerings.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-semibold text-xs text-brand-navy">
                          <span className="font-bold">{o.course?.code}</span>: {o.course?.title}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {o.academic_term?.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-800 font-medium">
                          {o.faculty?.full_name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 font-bold">
                          Sec {o.section}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {o.capacity} Seats
                        </TableCell>
                        <TableCell>
                          <Badge variant={o.status === "active" ? "success" : "neutral"}>
                            {o.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Master Course Catalog */}
        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Master Course Catalog</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standard curriculum courses authorized by the collegiate senate
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Curriculum Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => {
                      const dept = departments.find((d) => d.id === c.department_id);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-bold text-xs text-brand-navy whitespace-nowrap">
                            <Badge variant="primary">{c.code}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-slate-800 whitespace-nowrap">
                            {c.title}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                            {dept?.name || "General"}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-700 whitespace-nowrap">
                            {c.credits} Credits
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 max-w-md">
                            {c.description}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Academic Terms */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Academic Term Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Term State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {terms.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-bold text-xs text-brand-navy">
                          {t.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {formatDate(t.start_date)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {formatDate(t.end_date)}
                        </TableCell>
                        <TableCell>
                          {t.is_active ? (
                            <Badge variant="success">Current Term</Badge>
                          ) : (
                            <Badge variant="neutral">Concluded</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Departments */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Collegiate Academic Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Department Name</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-bold text-xs text-brand-navy">
                          <Badge variant="primary">{d.code}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-800">
                          {d.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(d.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
