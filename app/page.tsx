"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role === "student") {
        router.push("/student/dashboard");
      } else if (role === "faculty") {
        router.push("/faculty/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-navy border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Entering CampusOne Portal...</p>
      </div>
    </div>
  );
}
