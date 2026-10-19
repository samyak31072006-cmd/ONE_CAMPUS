import React from "react";
import { cn } from "@/lib/utils";

export function TableWrapper({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative w-full overflow-auto rounded-md border border-surface-200", className)} {...props}>
      {children}
    </div>
  );
}

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cn("w-full caption-bottom text-sm text-left border-collapse", className)} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-surface-100 text-slate-300 border-b border-surface-200 sticky top-0 z-10", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-surface-200 bg-surface-card", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-surface-100/60", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("h-10 px-4 text-xs font-semibold text-slate-300 uppercase tracking-wider", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("p-4 text-slate-200 text-sm align-middle", className)} {...props}>
      {children}
    </td>
  );
}
