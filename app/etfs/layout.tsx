import * as React from "react";
import { Sidebar } from "@/components/app/sidebar";

// This layout wraps everything under /etfs. We add Suspense here because
// Sidebar (client) uses useSearchParams, which must be inside a Suspense boundary.

export default function EtfsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
      <React.Suspense fallback={
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="h-5 w-28 animate-pulse rounded-md bg-neutral-200/80" />
          <div className="h-8 w-full animate-pulse rounded-md bg-neutral-200/80" />
          <div className="h-5 w-24 animate-pulse rounded-md bg-neutral-200/80" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-neutral-200/80" />
          <div className="h-4 w-36 animate-pulse rounded-md bg-neutral-200/80" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-neutral-200/80" />
        </div>
      }>
        <Sidebar />
      </React.Suspense>

      <React.Suspense fallback={<div className="p-6">Loading…</div>}>
        {children}
      </React.Suspense>
    </div>
  );
}
