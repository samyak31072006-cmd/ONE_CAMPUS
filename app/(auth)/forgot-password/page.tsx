"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-slate-950 shadow-md mb-3 font-bold">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Reset Your Academic Password
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your registered institutional email to receive recovery instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-card py-8 px-6 shadow-xl border border-surface-200 rounded-2xl sm:px-10">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-status-success mx-auto" />
              <h3 className="text-sm font-semibold text-white">Recovery Link Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an active account is linked to <strong className="text-slate-200">{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <Link href="/login" className="inline-block mt-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  College Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    placeholder="student@campusone.edu"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center text-xs text-brand-blue hover:underline"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
