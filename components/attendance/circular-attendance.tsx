"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Target,
  Info,
  Calendar,
  Layers
} from "lucide-react";

export interface CourseAttendanceSummary {
  courseCode: string;
  courseTitle: string;
  percentage: number;
  totalAttended: number;
  totalEligible: number;
}

export interface CircularAttendanceProps {
  percentage: number;
  totalEligible: number;
  totalAttended: number;
  isBelowThreshold: boolean;
  courseBreakdown?: CourseAttendanceSummary[];
  compact?: boolean;
}

export function CircularAttendance({
  percentage,
  totalEligible,
  totalAttended,
  isBelowThreshold,
  courseBreakdown = [],
  compact = false,
}: CircularAttendanceProps) {
  // Configurable target percentage (standard default: 75% institutional requirement)
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  // SVG circular geometry
  const size = compact ? 160 : 220;
  const strokeWidth = compact ? 12 : 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  // Benchmark marker angle for the target percentage
  const targetAngle = (targetPercentage / 100) * 360 - 90;
  const targetX = size / 2 + (radius + 2) * Math.cos((targetAngle * Math.PI) / 180);
  const targetY = size / 2 + (radius + 2) * Math.sin((targetAngle * Math.PI) / 180);

  // Determine dynamic ring color
  const isTargetMet = percentage >= targetPercentage;
  const ringColor = isTargetMet
    ? "#22C55E" // Emerald Green
    : percentage >= targetPercentage - 10
    ? "#F59E0B" // Amber
    : "#EF4444"; // Crimson Red

  // Calculations for bunks available or classes needed to attend
  const calculation = useMemo(() => {
    if (totalEligible === 0) {
      return {
        type: "neutral",
        bunks: 0,
        classesNeeded: 0,
        subtext: "No eligible sessions conducted yet",
        nextPercentageIfBunk: 0,
        nextPercentageIfAttend: 0,
        pctAfterCatchUp: 0,
      };
    }

    const pTarget = targetPercentage / 100;

    if (isTargetMet) {
      // Bunks available: how many upcoming classes can the student miss before dropping below target
      // A / (T + b) >= pTarget => b <= A / pTarget - T
      const maxBunks = Math.max(0, Math.floor(totalAttended / pTarget - totalEligible));

      // What if they bunk 1 class?
      const pctAfterOneBunk = Math.round((totalAttended / (totalEligible + 1)) * 1000) / 10;
      // What if they bunk maxBunks classes?
      const pctAfterAllBunks = maxBunks > 0
        ? Math.round((totalAttended / (totalEligible + maxBunks)) * 1000) / 10
        : percentage;

      return {
        type: "safe",
        bunks: maxBunks,
        classesNeeded: 0,
        subtext: maxBunks > 0
          ? `You can safely miss up to ${maxBunks} upcoming class${maxBunks === 1 ? "" : "es"} while keeping your attendance at or above ${targetPercentage}%.`
          : `You are currently at ${percentage}%. If you miss your next class, your attendance will drop to ${pctAfterOneBunk}% (below target).`,
        nextPercentageIfBunk: pctAfterOneBunk,
        nextPercentageIfAttend: Math.round(((totalAttended + 1) / (totalEligible + 1)) * 1000) / 10,
        pctAfterCatchUp: pctAfterAllBunks,
      };
    } else {
      // Classes to attend: how many consecutive classes must the student attend to reach target
      // (A + c) / (T + c) >= pTarget => c >= (pTarget * T - A) / (1 - pTarget)
      if (pTarget >= 1) {
        return {
          type: "impossible",
          bunks: 0,
          classesNeeded: Infinity,
          subtext: "Mathematically impossible to reach 100% since missed sessions cannot be undone without approved exemptions.",
          nextPercentageIfBunk: Math.round((totalAttended / (totalEligible + 1)) * 1000) / 10,
          nextPercentageIfAttend: Math.round(((totalAttended + 1) / (totalEligible + 1)) * 1000) / 10,
          pctAfterCatchUp: 100,
        };
      }

      const needed = Math.max(1, Math.ceil((pTarget * totalEligible - totalAttended) / (1 - pTarget)));
      const pctAfterCatchUp = Math.round(((totalAttended + needed) / (totalEligible + needed)) * 1000) / 10;

      return {
        type: "warning",
        bunks: 0,
        classesNeeded: needed,
        subtext: `You must attend the next ${needed} scheduled lecture${needed === 1 ? "" : "s"} consecutively without missing any to reach ${targetPercentage}%.`,
        nextPercentageIfBunk: Math.round((totalAttended / (totalEligible + 1)) * 1000) / 10,
        nextPercentageIfAttend: Math.round(((totalAttended + 1) / (totalEligible + 1)) * 1000) / 10,
        pctAfterCatchUp,
      };
    }
  }, [percentage, totalEligible, totalAttended, targetPercentage, isTargetMet]);

  if (compact) {
    // Compact preview widget for main student dashboard
    return (
      <div className="flex items-center gap-5">
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {totalAttended}/{totalEligible}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Badge variant={isTargetMet ? "success" : "danger"}>
              {isTargetMet ? "Safe Cushion" : "Below 75%"}
            </Badge>
          </div>
          <p className="text-sm font-bold text-white">
            {calculation.type === "safe"
              ? `${calculation.bunks} bunks available`
              : `Attend next ${calculation.classesNeeded} classes`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {calculation.subtext}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Circular Dashboard Card */}
      <Card className="border-surface-200 bg-surface-card shadow-lg overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-200/70">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-brand-blue" />
              <CardTitle className="text-lg font-bold text-slate-100">
                Official Attendance Gauge & Bunk Planner
              </CardTitle>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time calculation factoring conducted sessions, approved dean exemptions, and weightings
            </p>
          </div>

          {/* Interactive Target Criterion Selector */}
          <div className="flex items-center gap-2 bg-surface-100 p-1.5 rounded-lg border border-surface-200/80">
            <span className="text-xs font-semibold text-slate-400 pl-1">Target:</span>
            {[75, 80, 85, 90].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setTargetPercentage(val)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  targetPercentage === val
                    ? "bg-brand-blue text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-200/50"
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Circular Gauge Display */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
              <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90 drop-shadow-md">
                  {/* Faint track background */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#1E293B"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Colored progress ring */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Target milestone tick */}
                <div
                  className="absolute w-2.5 h-2.5 rounded-full bg-brand-blue border-2 border-surface-card shadow-sm"
                  style={{
                    left: `${targetX - 5}px`,
                    top: `${targetY - 5}px`,
                  }}
                  title={`Target: ${targetPercentage}%`}
                />

                {/* Center Content readout */}
                <div className="absolute flex flex-col items-center justify-center text-center px-4">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {percentage}%
                  </span>
                  <div className="mt-1.5">
                    <Badge variant={isTargetMet ? "success" : "danger"}>
                      {isTargetMet ? "Safe Zone" : "Action Required"}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400 mt-2 font-medium">
                    {totalAttended} / {totalEligible} classes
                  </span>
                </div>
              </div>

              {/* Legend & Target Badge */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ringColor }} />
                  <span>Current: {percentage}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />
                  <span>Target: {targetPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Bunk / Catch-Up Decision Engine */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              {calculation.type === "safe" && (
                <div className="rounded-xl p-5 border border-emerald-500/30 bg-emerald-950/20 shadow-inner">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                        Safe Attendance Margin
                      </span>
                      <h4 className="text-2xl font-black text-white mt-0.5">
                        {calculation.bunks > 0 ? (
                          <>You can bunk <span className="text-emerald-400">{calculation.bunks}</span> more class{calculation.bunks === 1 ? "" : "es"}</>
                        ) : (
                          <>Attend next class to maintain margin</>
                        )}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {calculation.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Future Projection Breakdown */}
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-surface-100/70 border border-surface-200/50">
                      <span className="text-[11px] text-slate-400 block">If you bunk 1 class:</span>
                      <span className="text-sm font-bold text-white">{calculation.nextPercentageIfBunk}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ({totalAttended}/{totalEligible + 1} sessions)
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-surface-100/70 border border-surface-200/50">
                      <span className="text-[11px] text-slate-400 block">If you attend next class:</span>
                      <span className="text-sm font-bold text-emerald-400">{calculation.nextPercentageIfAttend}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ({totalAttended + 1}/{totalEligible + 1} sessions)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {calculation.type === "warning" && (
                <div className="rounded-xl p-5 border border-amber-500/30 bg-amber-950/20 shadow-inner">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                        Attendance Recovery Required
                      </span>
                      <h4 className="text-2xl font-black text-white mt-0.5">
                        Attend next <span className="text-amber-400">{calculation.classesNeeded}</span> class{calculation.classesNeeded === 1 ? "" : "es"} consecutively
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {calculation.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Recovery Steps */}
                  <div className="mt-4 pt-4 border-t border-amber-500/20 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-surface-100/70 border border-surface-200/50">
                      <span className="text-[11px] text-slate-400 block">After {calculation.classesNeeded} classes:</span>
                      <span className="text-sm font-bold text-emerald-400">{calculation.pctAfterCatchUp}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Reaches target {targetPercentage}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-surface-100/70 border border-surface-200/50">
                      <span className="text-[11px] text-slate-400 block">If you miss another class:</span>
                      <span className="text-sm font-bold text-red-400">{calculation.nextPercentageIfBunk}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Deficit increases
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Institutional Compliance Seal */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-100/60 border border-surface-200/70 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-brand-blue shrink-0" />
                <span>
                  University Policy: Students with attendance below 75% at end of term are ineligible for end-semester examinations without approved medical/dean exemptions.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course-by-Course Bunk & Target Breakdown */}
      {courseBreakdown.length > 0 && (
        <Card className="border-surface-200 bg-surface-card shadow-sm">
          <CardHeader className="pb-3 border-b border-surface-200/70">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-blue" />
              <CardTitle className="text-base font-bold text-slate-100">
                Subject-Wise Bunk & Attendance Analysis
              </CardTitle>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of bunks available or required attendance per enrolled course (Target: {targetPercentage}%)
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courseBreakdown.map((course) => {
                const pTarget = targetPercentage / 100;
                const courseIsMet = course.percentage >= targetPercentage;

                let courseBunks = 0;
                let courseNeeded = 0;

                if (courseIsMet) {
                  courseBunks = Math.max(0, Math.floor(course.totalAttended / pTarget - course.totalEligible));
                } else if (pTarget < 1) {
                  courseNeeded = Math.max(1, Math.ceil((pTarget * course.totalEligible - course.totalAttended) / (1 - pTarget)));
                }

                return (
                  <div
                    key={course.courseCode}
                    className="p-4 rounded-xl border border-surface-200 bg-surface-100/50 flex flex-col justify-between space-y-3 transition-colors hover:border-brand-blue/40"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-brand-blue">{course.courseCode}</span>
                        <Badge variant={courseIsMet ? "success" : "danger"}>
                          {course.percentage}%
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1 truncate">
                        {course.courseTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {course.totalAttended} of {course.totalEligible} sessions
                      </p>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full bg-surface-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            courseIsMet ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, course.percentage)}%` }}
                        />
                      </div>

                      {/* Course Bunk Message */}
                      <p className="text-xs font-semibold">
                        {courseIsMet ? (
                          <span className="text-emerald-400">
                            ✓ {courseBunks > 0 ? `Can bunk ${courseBunks} lecture${courseBunks === 1 ? "" : "s"}` : "On the line (attend next)"}
                          </span>
                        ) : (
                          <span className="text-amber-400">
                            ⚠ Must attend next {courseNeeded} lecture{courseNeeded === 1 ? "" : "s"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
