import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.etf.findMany({
    where: { category: { not: null } },
    select: { category: true },
  });

  const set = new Set<string>();
  for (const r of rows) {
    if (typeof r.category === "string" && r.category.trim().length) {
      set.add(r.category.trim());
    }
  }
  const categories = Array.from(set).sort((a, b) => a.localeCompare(b));

  return NextResponse.json({ categories });
}
