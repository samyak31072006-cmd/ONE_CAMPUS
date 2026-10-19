import React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-300">
            {label}
            {props.required && <span className="text-status-danger ml-0.5">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={!!error}
          className={cn(
            "w-full rounded-md border border-surface-300 bg-surface-100/90 px-3 py-2 text-sm text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:bg-surface-200 disabled:text-slate-500",
            error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p className="text-xs text-status-danger mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
