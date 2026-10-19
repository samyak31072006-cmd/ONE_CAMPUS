import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
}

export function Alert({ variant = "info", title, className, children, ...props }: AlertProps) {
  const variants = {
    info: {
      bg: "bg-status-infoBg border-status-info/30 text-status-infoText",
      icon: <Info className="h-5 w-5 text-status-info shrink-0 mt-0.5" />,
    },
    success: {
      bg: "bg-status-successBg border-status-success/30 text-status-successText",
      icon: <CheckCircle2 className="h-5 w-5 text-status-success shrink-0 mt-0.5" />,
    },
    warning: {
      bg: "bg-status-warningBg border-status-warning/30 text-status-warningText",
      icon: <AlertTriangle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />,
    },
    danger: {
      bg: "bg-status-dangerBg border-status-danger/30 text-status-dangerText",
      icon: <AlertCircle className="h-5 w-5 text-status-danger shrink-0 mt-0.5" />,
    },
  };

  const current = variants[variant];

  return (
    <div
      role="alert"
      className={cn("flex gap-3 rounded-lg border p-4 text-sm leading-relaxed", current.bg, className)}
      {...props}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="text-xs md:text-sm">{children}</div>
      </div>
    </div>
  );
}
