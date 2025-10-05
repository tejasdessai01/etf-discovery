import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // SQLite can be finicky with distinct+orderBy; fetch then dedupe in JS.
  const rows = await prisma.etf.findMany({
    where: { issuer: { not: null } },
    select: { issuer: true },
  });

  const set = new Set<string>();
  for (const r of rows) {
    if (typeof r.issuer === "string" && r.issuer.trim().length) {
      set.add(r.issuer.trim());
    }
  }
  const issuers = Array.from(set).sort((a, b) => a.localeCompare(b));

  return NextResponse.json({ issuers });
}
