"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EtfTable } from "./table";
import { useRouter, useSearchParams } from "next/navigation";

function ExportButton() {
  const sp = useSearchParams();
  const params = new URLSearchParams(sp.toString());
  if (!params.get("pageSize")) params.set("pageSize", "10");
  const href = `/api/etfs.csv?${params.toString()}`;
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href}>Export CSV</Link>
    </Button>
  );
}

function ResetButton() {
  const router = useRouter();
  const onReset = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", "10");
    params.set("sort", "ticker");
    params.set("dir", "asc");
    router.push(`/etfs?${params.toString()}`);
  };
  return (
    <Button variant="outline" size="sm" onClick={onReset}>
      Reset View
    </Button>
  );
}

function CopyLinkButton() {
  const sp = useSearchParams();
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      const params = new URLSearchParams(sp.toString());
      const url = `${window.location.origin}/etfs?${params.toString()}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const params = new URLSearchParams(sp.toString());
      const url = `${window.location.origin}/etfs?${params.toString()}`;
      prompt("Copy this link", url);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onCopy}>
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}

export default function EtfsPage() {
  return (
    <React.Suspense fallback={<div className="p-6">Loading…</div>}>
      <div className="p-6 space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">ETF Discovery</h1>
          <div className="flex items-center gap-2">
            <CopyLinkButton />
            <ResetButton />
            <ExportButton />
          </div>
        </header>

        <Card className="p-4">
          <EtfTable />
        </Card>
      </div>
    </React.Suspense>
  );
}
