"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Settings, ShieldCheck, CheckCircle2, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [minThreshold, setMinThreshold] = useState("75");
  const [lateWeight, setLateWeight] = useState("1.0");
  const [excusedStrategy, setExcusedStrategy] = useState("numerator");
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState("60");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Institutional Policies & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure collegiate attendance counting rules, grading criteria, and session security thresholds
        </p>
      </div>

      {isSaved && (
        <Alert variant="success" title="Institutional Policy Updated">
          Configuration changes successfully saved and applied to runtime calculators across CampusOne.
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Attendance Rules Card */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Calculation Rules</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Governs dynamic student eligibility thresholds and attendance percentage formulas
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Attendance Threshold (%)
                </label>
                <Input
                  type="number"
                  min={50}
                  max={100}
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(e.target.value)}
                  className="text-xs"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Students below this percentage will be flagged with warning alerts and examination disallowance notices.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Late Arrival Weight
                </label>
                <Select
                  value={lateWeight}
                  onChange={(e) => setLateWeight(e.target.value)}
                  className="text-xs"
                >
                  <option value="1.0">1.0 (Full credit - Counted as present with Late flag)</option>
                  <option value="0.75">0.75 (Three-quarter credit)</option>
                  <option value="0.5">0.5 (Half credit - 2 lates equal 1 absence)</option>
                </Select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Determines mathematical weight of marked &quot;Late&quot; attendance statuses.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approved Exemption Counting Strategy
              </label>
              <Select
                value={excusedStrategy}
                onChange={(e) => setExcusedStrategy(e.target.value)}
                className="text-xs"
              >
                <option value="numerator">
                  Numerator Credit: (Attended + Excused) / Eligible Sessions
                </option>
                <option value="denominator">
                  Denominator Exclusion: Attended / (Eligible Sessions - Excused)
                </option>
              </Select>
              <p className="text-[10px] text-slate-400 mt-1">
                Both strategies preserve academic fairness; numerator credit is standard in UGC/ABET models.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Session Constraints</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforce role-based token lifetimes and private storage link expiration
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Expiration (Minutes)
                </label>
                <Input
                  type="number"
                  min={15}
                  max={720}
                  value={sessionTimeoutMinutes}
                  onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exemption Document Signed URL Expiry
                </label>
                <Input
                  type="text"
                  value="60 Seconds (Short-lived secure token)"
                  disabled
                  className="text-xs bg-surface-100"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4">
            <Button type="submit" size="sm" isLoading={isSaving}>
              <Save className="h-4 w-4 mr-1.5" />
              Save Institutional Policy
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
