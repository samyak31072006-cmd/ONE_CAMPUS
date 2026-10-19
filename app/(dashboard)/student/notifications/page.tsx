"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { mockNotifications } from "@/lib/mock-data";
import { Notification, NotificationType } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  CalendarCheck,
  FileSpreadsheet,
  FileQuestion,
  Calendar,
  Info,
  ArrowRight,
} from "lucide-react";

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filterType, setFilterType] = useState<string>("all");

  const myNotifications = useMemo(() => {
    return notifications
      .filter((n) => n.user_id === user?.id)
      .filter((n) => (filterType === "all" ? true : n.type === filterType))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [notifications, user?.id, filterType]);

  const unreadCount = myNotifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.user_id === user?.id ? { ...n, is_read: true } : n))
    );
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n))
    );
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "assessment":
        return <FileSpreadsheet className="h-4 w-4 text-brand-blue" />;
      case "exemption":
        return <FileQuestion className="h-4 w-4 text-amber-600" />;
      case "attendance":
        return <CalendarCheck className="h-4 w-4 text-status-success" />;
      case "timetable":
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case "system":
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Notifications & Academic Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time announcements regarding class schedule changes, exam marks, and exemptions
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "All Alerts" },
          { key: "assessment", label: "Marks & Assessments" },
          { key: "exemption", label: "Exemptions" },
          { key: "timetable", label: "Timetable Updates" },
          { key: "attendance", label: "Attendance" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === tab.key
                ? "bg-brand-navy text-white"
                : "bg-surface-100 text-slate-600 hover:bg-surface-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Feed */}
      <div className="space-y-3">
        {myNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-xs text-slate-400">
              No notifications matching the selected filter.
            </CardContent>
          </Card>
        ) : (
          myNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-colors ${
                !notif.is_read ? "border-brand-blue/40 bg-blue-50/20" : ""
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-100 border border-surface-200 shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-brand-navy">
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-status-danger" />
                      )}
                      <Badge variant="neutral" className="text-[10px] uppercase">
                        {notif.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.link && (
                    <Link href={notif.link}>
                      <Button variant="ghost" size="sm" className="text-xs text-brand-blue h-8 px-2">
                        View <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                  <button
                    onClick={() => handleToggleRead(notif.id)}
                    className="text-slate-400 hover:text-slate-600 p-1 text-xs"
                    title={notif.is_read ? "Mark as unread" : "Mark as read"}
                  >
                    {notif.is_read ? "Unread" : "Read"}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
