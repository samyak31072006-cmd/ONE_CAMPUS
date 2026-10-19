"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, UserRole } from "@/types/database";
import { mockProfiles } from "./mock-data";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  quickSwitchUser: (userId: string) => void;
  allProfiles: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize from document.cookie or localStorage
  useEffect(() => {
    try {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return null;
      };

      const savedUserId = getCookie("campusone_user_id") || (typeof window !== "undefined" ? localStorage.getItem("campusone_user_id") : null);
      if (savedUserId) {
        const found = mockProfiles.find((p) => p.id === savedUserId);
        if (found) {
          setUser(found);
          setRole(found.role);
          document.cookie = `campusone_user_id=${found.id}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `campusone_role=${found.role}; path=/; max-age=86400; SameSite=Lax`;
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const found =
        mockProfiles.find((p) => p.email.toLowerCase() === trimmedEmail) ||
        (requestedRole ? mockProfiles.find((p) => p.role === requestedRole) : undefined);

      if (found) {
        setUser(found);
        setRole(found.role);
        document.cookie = `campusone_user_id=${found.id}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `campusone_role=${found.role}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem("campusone_user_id", found.id);

        let target = `/${found.role}/dashboard`;
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get("redirect");
          if (redirect && redirect.startsWith(`/${found.role}`)) {
            target = redirect;
          }
          window.location.href = target;
        } else {
          router.push(target);
        }
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    document.cookie = "campusone_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "campusone_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      localStorage.removeItem("campusone_user_id");
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  const quickSwitchUser = (userId: string) => {
    const found = mockProfiles.find((p) => p.id === userId);
    if (found) {
      setUser(found);
      setRole(found.role);
      document.cookie = `campusone_user_id=${found.id}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `campusone_role=${found.role}; path=/; max-age=86400; SameSite=Lax`;
      if (typeof window !== "undefined") {
        localStorage.setItem("campusone_user_id", found.id);
        window.location.href = `/${found.role}/dashboard`;
      } else {
        router.push(`/${found.role}/dashboard`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        logout,
        quickSwitchUser,
        allProfiles: mockProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
