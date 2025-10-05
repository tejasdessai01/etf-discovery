import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Etf } from "@prisma/client";

function fmtUSD(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default async function ComparePage({
  searchParams,
}: {
  // In Next 15, searchParams can be a Promise in server components
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = typeof sp.tickers === "string" ? sp.tickers : "";
  const tickers = Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    )
  ).slice(0, 12); // cap to 12 to keep layout tidy

  if (tickers.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-sm">
          <Link href="/etfs" className="underline underline-offset-4">← Back to ETFs</Link>
        </div>
        <Card className="p-6">
          <div className="text-xl font-semibold">Nothing to compare</div>
          <div className="text-neutral-600 mt-2">Select at least two ETFs from the table and click Compare.</div>
        </Card>
      </div>
    );
  }

  const found: Etf[] = await prisma.etf.findMany({
    where: { ticker: { in: tickers } },
  });

  // Order by the input sequence
  const map = new Map(found.map((e) => [e.ticker, e]));
  const ordered: Etf[] = tickers
    .map((t) => map.get(t))
    .filter((x): x is Etf => Boolean(x));

  return (
    <div className="p-6 space-y-4">
      <div className="text-sm">
        <Link href="/etfs" className="underline underline-offset-4">← Back to ETFs</Link>
      </div>

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Compare ({ordered.length})</h1>
        <div className="text-sm text-neutral-500">tickers: {tickers.join(", ")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ordered.map((e) => (
          <Card key={e.ticker} className="p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-semibold">{e.ticker}</div>
              <div className="text-xs text-neutral-500">
                {e.inceptionDate ? e.inceptionDate.toISOString().slice(0, 10) : "—"}
              </div>
            </div>
            <div className="text-sm text-neutral-700">{e.name}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-neutral-500">Issuer</div>
                <div>{e.issuer ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Category</div>
                <div>{e.category ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Expense (bps)</div>
                <div>{e.expenseBps ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">AUM ($)</div>
                <div>{fmtUSD(e.aumUSD as unknown as number | null)}</div>
              </div>
            </div>
            <div className="pt-2 text-sm">
              <Link href={`/etf/${encodeURIComponent(e.ticker)}`} className="underline underline-offset-4">
                Open detail →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
