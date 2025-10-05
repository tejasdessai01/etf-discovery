import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";

function fmtUSD(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default async function EtfDetailPage({
  params,
}: {
  // Next 15: route params provided as a Promise in server components
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const t = (ticker || "").toUpperCase().trim();

  if (!t) {
    notFound();
  }

  const etf = await prisma.etf.findUnique({
    where: { ticker: t },
  });

  if (!etf) {
    notFound();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="text-sm">
        <Link href="/etfs" className="underline underline-offset-4">← Back to ETFs</Link>
      </div>

      <Card className="p-6 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{etf.ticker}</h1>
          <div className="text-xs text-neutral-500">
            {etf.inceptionDate ? etf.inceptionDate.toISOString().slice(0, 10) : "—"}
          </div>
        </div>
        <div className="text-neutral-800">{etf.name}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-neutral-500">Issuer</div>
            <div>{etf.issuer ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Category</div>
            <div>{etf.category ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Expense (bps)</div>
            <div>{etf.expenseBps ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">AUM ($)</div>
            <div>{fmtUSD(etf.aumUSD as unknown as number | null)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Created</div>
            <div>{etf.createdAt.toISOString().slice(0, 10)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Updated</div>
            <div>{etf.updatedAt.toISOString().slice(0, 10)}</div>
          </div>
        </div>

        <div className="pt-2 text-sm">
          <Link
            href={`https://www.google.com/search?q=${encodeURIComponent(etf.ticker + " ETF")}`}
            className="underline underline-offset-4"
            target="_blank"
          >
            Search news →
          </Link>
        </div>
      </Card>
    </div>
  );
}