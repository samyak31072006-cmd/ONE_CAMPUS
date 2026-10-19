"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { mockProfiles, mockAuditLogs } from "@/lib/mock-data";
import { Profile, UserRole } from "@/types/database";
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
  Users,
  Search,
  UserCheck,
  UserX,
  ShieldAlert,
  PlusCircle,
  Shield,
  GraduationCap,
} from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("student");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.college_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" ? true : p.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [profiles, searchTerm, roleFilter]);

  const handleToggleActive = (profile: Profile) => {
    const nextStatus = !profile.is_active;

    setProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, is_active: nextStatus } : p))
    );

    // Audit log
    mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor_id: currentAdmin?.id || null,
      actor: currentAdmin || undefined,
      action: nextStatus ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entity_type: "profile",
      entity_id: profile.id,
      old_values: { is_active: profile.is_active },
      new_values: { is_active: nextStatus },
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    });

    setNotification(
      `User ${profile.full_name} (${profile.college_id}) has been ${nextStatus ? "ACTIVATED" : "DEACTIVATED"}. Audit logged.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenRoleModal = (profile: Profile) => {
    setTargetUser(profile);
    setNewRole(profile.role);
    setIsRoleModalOpen(true);
  };

  const handleExecuteRoleChange = () => {
    if (!targetUser) return;

    setProfiles((prev) =>
      prev.map((p) => (p.id === targetUser.id ? { ...p, role: newRole } : p))
    );

    // Audit log
    mockAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor_id: currentAdmin?.id || null,
      actor: currentAdmin || undefined,
      action: "ROLE_PROVISIONED",
      entity_type: "profile",
      entity_id: targetUser.id,
      old_values: { role: targetUser.role },
      new_values: { role: newRole },
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    });

    setIsRoleModalOpen(false);
    setNotification(
      `Role for ${targetUser.full_name} officially modified to ${newRole.toUpperCase()}. Privileged audit trail recorded.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">User & Identity Provisioning</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer collegiate accounts, activate/deactivate credentials, and assign privileged roles
          </p>
        </div>
      </div>

      {notification && (
        <Alert variant="success" title="Administrative Action Executed">
          {notification}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, roll/college ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs py-1.5 h-9"
            >
              <option value="all">All Academic Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Administrators</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Directory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Collegiate Directory ({filteredProfiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>College ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Semester / Sec</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Administrative Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-xs text-brand-navy whitespace-nowrap">
                      {p.college_id}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-slate-900 whitespace-nowrap">
                      {p.full_name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {p.email}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          p.role === "admin"
                            ? "warning"
                            : p.role === "faculty"
                            ? "info"
                            : "success"
                        }
                      >
                        {p.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {p.semester ? `Sem ${p.semester} (${p.section})` : "Faculty / Admin"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {p.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Deactivated</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRoleModal(p)}
                          className="text-xs h-7 px-2"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Change Role
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(p)}
                          className={`text-xs h-7 px-2 ${
                            p.is_active
                              ? "text-status-danger hover:bg-red-50"
                              : "text-status-success hover:bg-green-50"
                          }`}
                        >
                          {p.is_active ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardContent>
      </Card>

      {/* Role Provisioning Modal */}
      <Dialog
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Controlled Role Provisioning"
        description="Assigning an elevated role unlocks privileged academic endpoints. All changes are logged."
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 text-xs">
            <p>
              Target User: <strong className="text-slate-900">{targetUser?.full_name}</strong>
            </p>
            <p className="text-slate-500">
              College ID: {targetUser?.college_id} • Current Role:{" "}
              <span className="font-semibold capitalize text-brand-navy">{targetUser?.role}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select New System Role <span className="text-status-danger">*</span>
            </label>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="text-xs"
            >
              <option value="student">Student (Standard academic attendance & marks views)</option>
              <option value="faculty">Faculty (Course instruction, grading, attendance marking)</option>
              <option value="admin">Administrator (Complete collegiate configuration & oversight)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteRoleChange}
            >
              Confirm Role Reassignment
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
