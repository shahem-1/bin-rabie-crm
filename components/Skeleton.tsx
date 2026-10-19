"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ className, variant = "text", width, height, lines = 1 }: SkeletonProps) {
  if (variant === "circular") {
    return (
      <div
        className={cn("skeleton rounded-full", className)}
        style={{ width: width || "1rem", height: height || "1rem" }}
      />
    );
  }

  if (variant === "rectangular") {
    return (
      <div
        className={cn("skeleton rounded-lg", className)}
        style={{ width: width || "100%", height: height || "1rem" }}
      />
    );
  }

  // Text variant - multiple lines
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{
            width: i === lines - 1 && width ? width : "100%",
            minWidth: "60%",
          }}
        />
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
  hasIcon?: boolean;
  hasChart?: boolean;
}

export function CardSkeleton({ className, hasIcon = false, hasChart = false }: CardSkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-line bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" lines={2} width="40%" />
        {hasIcon && <Skeleton variant="circular" width="3rem" height="3rem" />}
      </div>
      {hasChart && (
        <div className="mt-4 h-48 w-full">
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>
      )}
      {!hasChart && <Skeleton variant="text" lines={3} className="mt-4" />}
    </div>
  );
}

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  className?: string;
}

export function TableSkeleton({ columns = 5, rows = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-line bg-card overflow-hidden shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-slate-50 text-muted">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-start font-medium">
                  <Skeleton variant="text" width="80%" height="1rem" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="border-b border-line last:border-0">
                {Array.from({ length: columns }).map((_, col) => (
                  <td key={col} className="px-4 py-3">
                    <Skeleton variant="text" width="90%" height="1rem" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface KPISkeletonProps {
  count?: number;
  className?: string;
}

export function KPISkeleton({ count = 4, className }: KPISkeletonProps) {
  return (
    <section className={cn("grid grid-cols-2 gap-4 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" className="mt-1" />
          </div>
          <Skeleton variant="circular" width="3rem" height="3rem" />
        </div>
      ))}
    </section>
  );
}