import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const SORT_WHITELIST = new Set<keyof Prisma.EtfOrderByWithRelationInput>([
  "ticker",
  "name",
  "issuer",
  "expenseBps",
  "aumUSD",
  "inceptionDate",
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 50);
  const raw = (searchParams.get("q") || "").trim();

  const sortParam = (searchParams.get("sort") || "ticker").trim() as keyof Prisma.EtfOrderByWithRelationInput;
  const dirParam = (searchParams.get("dir") || "asc").toLowerCase() === "desc" ? "desc" : "asc";

  // Filters (comma-separated)
  const issuerParam = (searchParams.get("issuer") || "").trim();
  const categoryParam = (searchParams.get("category") || "").trim();
  const issuers = issuerParam ? issuerParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const categories = categoryParam ? categoryParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  // SQLite-safe "case-insensitive-ish" search
  const q = raw, qL = raw.toLowerCase(), qU = raw.toUpperCase();

  const where: Prisma.EtfWhereInput = {};
  if (raw.length > 0) {
    where.OR = [
      { ticker: { contains: q } }, { ticker: { contains: qL } }, { ticker: { contains: qU } },
      { name: { contains: q } },   { name: { contains: qL } },   { name: { contains: qU } },
      { issuer: { contains: q } }, { issuer: { contains: qL } }, { issuer: { contains: qU } },
    ];
  }
  if (issuers.length > 0) where.issuer = { in: issuers };
  if (categories.length > 0) where.category = { in: categories };

  const orderBy: Prisma.EtfOrderByWithRelationInput =
    SORT_WHITELIST.has(sortParam) ? { [sortParam]: dirParam } : { ticker: "asc" };

  const [items, total] = await Promise.all([
    prisma.etf.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.etf.count({ where }),
  ]);

  const shaped = items.map((x) => ({
    id: x.id,
    ticker: x.ticker,
    name: x.name,
    issuer: x.issuer,
    category: x.category,
    expenseBps: x.expenseBps ?? null,
    aumUSD: x.aumUSD == null ? null : Number(x.aumUSD as unknown as number),
    inceptionDate: x.inceptionDate ? x.inceptionDate.toISOString() : null,
    createdAt: x.createdAt.toISOString(),
    updatedAt: x.updatedAt.toISOString(),
  }));

  return NextResponse.json({ items: shaped, total, page, pageSize });
}
