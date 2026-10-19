"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  mockTimetableEntries,
  mockCourseOfferings,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function FacultyTimetablePage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  const [activeDay, setActiveDay] = useState<string>("monday");

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
  ];

  const assignedOfferings = useMemo(() => {
    return mockCourseOfferings.filter(
      (o) => o.faculty_id === user?.id || user?.role === "admin"
    );
  }, [user?.id, user?.role]);

  const assignedOfferingIds = useMemo(() => {
    return new Set(assignedOfferings.map((o) => o.id));
  }, [assignedOfferings]);

  const facultySlots = useMemo(() => {
    return mockTimetableEntries
      .filter((t) => assignedOfferingIds.has(t.course_offering_id))
      .map((entry) => {
        const offering = assignedOfferings.find((o) => o.id === entry.course_offering_id);
        return {
          id: entry.id,
          dayOfWeek: entry.day_of_week,
          startTime: entry.start_time,
          endTime: entry.end_time,
          room: entry.room,
          courseCode: offering?.course?.code || "CS",
          courseTitle: offering?.course?.title || "Course",
          section: offering?.section || "A",
          capacity: offering?.capacity || 60,
        };
      });
  }, [assignedOfferings, assignedOfferingIds]);

  const dailySchedule = useMemo(() => {
    return facultySlots
      .filter((s) => s.dayOfWeek === activeDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [facultySlots, activeDay]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Faculty Teaching Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Allocated lecture halls and scheduled instructional hours • Fall 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "weekly" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("weekly")}
          >
            Weekly Grid
          </Button>
          <Button
            variant={viewMode === "daily" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("daily")}
          >
            Daily Agenda
          </Button>
        </div>
      </div>

      {viewMode === "weekly" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => {
            const slots = facultySlots
              .filter((s) => s.dayOfWeek === day.key)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <Card key={day.key} className="flex flex-col">
                <CardHeader className="p-3 bg-surface-50 border-b border-surface-200">
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-700">
                    {day.label}
                  </CardTitle>
                  <p className="text-[10px] text-slate-400">
                    {slots.length} {slots.length === 1 ? "Lecture" : "Lectures"}
                  </p>
                </CardHeader>
                <CardContent className="p-3 flex-1 space-y-3">
                  {slots.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 italic">
                      No teaching hours
                    </div>
                  ) : (
                    slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-lg border border-brand-blue/20 bg-blue-50/40 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="primary">{slot.courseCode}</Badge>
                          <span className="text-[11px] font-bold text-brand-navy">
                            Sec {slot.section}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">
                          {slot.courseTitle}
                        </h4>
                        <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-brand-navy">
                            <MapPin className="h-3 w-3 text-brand-blue" />
                            <span>{slot.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Users className="h-3 w-3" />
                            <span>Cap: {slot.capacity} students</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-lg overflow-x-auto max-w-fit">
            {days.map((day) => (
              <button
                key={day.key}
                onClick={() => setActiveDay(day.key)}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  activeDay === day.key
                    ? "bg-white text-brand-navy shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{activeDay}&apos;s Instructional Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailySchedule.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No lectures scheduled for {activeDay}.
                </div>
              ) : (
                dailySchedule.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-surface-200 bg-white hover:border-brand-blue/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-navy">
                            {item.courseCode}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-800">
                            {item.courseTitle}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Section {item.section} • Capacity {item.capacity}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="h-4 w-4 text-brand-blue" />
                        <span className="font-medium">
                          {formatTime(item.startTime)} – {formatTime(item.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="h-4 w-4 text-brand-blue" />
                        <span className="font-semibold">{item.room}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
