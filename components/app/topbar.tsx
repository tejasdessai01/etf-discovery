"use client";

import Link from "next/link";
import * as React from "react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded bg-black" aria-hidden />
            <span className="text-sm font-semibold tracking-tight">ETF Discovery</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/etfs" className="text-neutral-600 hover:underline underline-offset-4">
              Explore
            </Link>
            <Link href="/compare?tickers=SPY,QQQ" className="text-neutral-600 hover:underline underline-offset-4">
              Compare
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/etfs"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Open App
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-block rounded-md border px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Docs
          </a>
        </div>
      </div>
    </header>
  );
}
