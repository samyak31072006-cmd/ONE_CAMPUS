import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
            {label}
            {props.required && <span className="text-status-danger ml-0.5">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          className={cn(
            "w-full rounded-md border border-surface-300 bg-surface-100/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:bg-surface-200 disabled:text-slate-500",
            error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-status-danger mt-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-desc`} className="text-xs text-slate-400 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
