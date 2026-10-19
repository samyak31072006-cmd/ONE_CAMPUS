"use client";

import React, { useState } from "react";
import {
  mockTimetableEntries,
  mockCourseOfferings,
} from "@/lib/mock-data";
import { TimetableEntry, DayOfWeek } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from "@/components/ui/table";
import { formatTime } from "@/lib/utils";
import { Calendar, PlusCircle, Clock, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>(mockTimetableEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states
  const [offeringId, setOfferingId] = useState(mockCourseOfferings[0]?.id || "");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("monday");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:30");
  const [room, setRoom] = useState("Auditorium B-101");

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (endTime <= startTime) {
      setFormError("End time must be after start time");
      return;
    }

    // Check for room conflict in same day
    const roomConflict = entries.find(
      (entry) =>
        entry.day_of_week === dayOfWeek &&
        entry.room.toLowerCase() === room.trim().toLowerCase() &&
        ((startTime >= entry.start_time.substring(0, 5) && startTime < entry.end_time.substring(0, 5)) ||
          (endTime > entry.start_time.substring(0, 5) && endTime <= entry.end_time.substring(0, 5)))
    );

    if (roomConflict) {
      setFormError(`Room Conflict! ${room} is already reserved on ${dayOfWeek.toUpperCase()} between ${roomConflict.start_time} and ${roomConflict.end_time}`);
      return;
    }

    const newEntry: TimetableEntry = {
      id: `tt-${Date.now()}`,
      course_offering_id: offeringId,
      day_of_week: dayOfWeek,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      room: room.trim(),
      effective_start_date: "2026-08-15",
      effective_end_date: "2026-12-20",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEntries([...entries, newEntry]);
    setIsModalOpen(false);
    setNotification("New timetable entry created successfully with verified room availability.");
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Timetable Master Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure instructional lecture hours, allocate rooms, and prevent scheduling collisions
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add Schedule Slot
        </Button>
      </div>

      {notification && (
        <Alert variant="success" title="Schedule Updated">
          {notification}
        </Alert>
      )}

      {/* Master Timetable Table */}
      <Card>
        <CardHeader>
          <CardTitle>Institutional Timetable Allocations ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day of Week</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Course Offering</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Classroom / Lab</TableHead>
                  <TableHead>Term Validity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const offering = mockCourseOfferings.find((o) => o.id === entry.course_offering_id);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-semibold text-xs capitalize text-brand-navy whitespace-nowrap">
                        {entry.day_of_week}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                        {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-900 whitespace-nowrap">
                        <Badge variant="primary" className="mr-1.5">{offering?.course?.code}</Badge>
                        {offering?.course?.title} (Sec {offering?.section})
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {offering?.faculty?.full_name}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                        <MapPin className="h-3 w-3 inline mr-1 text-brand-blue" />
                        {entry.room}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {entry.effective_start_date} to {entry.effective_end_date || "End of Term"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>

      {/* Add Slot Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Timetable Slot"
        description="Assign a course offering to a designated day, time slot, and classroom."
        maxWidth="md"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          {formError && (
            <div className="p-3 rounded bg-status-dangerBg text-status-dangerText text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Offering <span className="text-status-danger">*</span>
            </label>
            <Select
              value={offeringId}
              onChange={(e) => setOfferingId(e.target.value)}
              className="text-xs"
              required
            >
              {mockCourseOfferings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.course?.code}: {o.course?.title} (Sec {o.section}) — {o.faculty?.full_name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day
              </label>
              <Select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="text-xs"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Classroom / Lecture Hall <span className="text-status-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Auditorium A-201, Lab 3B"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Verify & Add Slot
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
