import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  const variants = {
    success: "bg-status-successBg text-status-successText border-status-success/20",
    warning: "bg-status-warningBg text-status-warningText border-status-warning/20",
    danger: "bg-status-dangerBg text-status-dangerText border-status-danger/20",
    info: "bg-status-infoBg text-status-infoText border-status-info/20",
    neutral: "bg-surface-100 text-slate-300 border-surface-200",
    primary: "bg-brand-blue/15 text-brand-blue border-brand-blue/30 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
