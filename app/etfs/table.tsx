"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

type Row = {
  id: string;
  ticker: string;
  name: string;
  issuer?: string | null;
  category?: string | null;
  expenseBps?: number | null;
  aumUSD?: number | null;
  inceptionDate?: string | null;
};

type ColKey = "ticker" | "name" | "issuer" | "category" | "expenseBps" | "aumUSD" | "inceptionDate";

const ALL_COLS: { key: ColKey; label: string; sortable?: boolean }[] = [
  { key: "ticker", label: "Ticker", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "issuer", label: "Issuer", sortable: true },
  { key: "category", label: "Category" },
  { key: "expenseBps", label: "Expense (bps)", sortable: true },
  { key: "aumUSD", label: "AUM ($)", sortable: true },
  { key: "inceptionDate", label: "Inception", sortable: true },
];

const WL_KEY = "watchlist_v1";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const id = setTimeout(onClose, 2500);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md border bg-white px-3 py-2 text-sm shadow">
      {message}
    </div>
  );
}

export function EtfTable() {
  const sp = useSearchParams();
  const router = useRouter();

  const q = (sp.get("q") || "").trim();
  const page = Number(sp.get("page") || "1");
  const pageSize = Number(sp.get("pageSize") || "10");

  const sort = (sp.get("sort") || "ticker") as ColKey;
  const dir = (sp.get("dir") || "asc").toLowerCase() === "desc" ? "desc" : "asc";

  const issuer = sp.get("issuer") || "";
  const category = sp.get("category") || "";
  const watchOnly = sp.get("watch") === "1";

  // Column visibility — compute directly from the URL param to avoid hook warnings
  const colsParam = sp.get("cols") || "";

  const [visibleCols, setVisibleCols] = React.useState<Set<ColKey>>(() => {
    if (!colsParam) return new Set<ColKey>(ALL_COLS.map((c) => c.key));
    const parts = colsParam.split(",").map((s) => s.trim()).filter(Boolean) as ColKey[];
    return new Set<ColKey>(parts);
  });

  React.useEffect(() => {
    const next = !colsParam
      ? new Set<ColKey>(ALL_COLS.map((c) => c.key))
      : new Set<ColKey>(
          colsParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) as ColKey[]
        );
    setVisibleCols(next);
  }, [colsParam]);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const [watchlist, setWatchlist] = React.useState<Set<string>>(new Set());

  // selection state for compare (resets when the page of rows changes)
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const clearSelection = () => setSelected(new Set());

  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(WL_KEY) : null;
      if (raw) setWatchlist(new Set<string>(JSON.parse(raw)));
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(WL_KEY, JSON.stringify(Array.from(watchlist)));
      }
    } catch {
      // ignore
    }
  }, [watchlist]);

  const pushParams = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.push(`/etfs?${params.toString()}`);
  };

  const setPage = (p: number) => {
    clearSelection();
    pushParams({ page: String(p) });
  };

  const toggleSort = (key: ColKey) => {
    clearSelection();
    const nextDir = key === sort ? (dir === "asc" ? "desc" : "asc") : "asc";
    pushParams({ sort: key, dir: nextDir, page: "1" });
  };

  const setPageSize = (size: number) => {
    clearSelection();
    pushParams({ pageSize: String(size), page: "1" });
  };

  const setColsParam = (setV: Set<ColKey>) => {
    const list = Array.from(setV);
    if (list.length === ALL_COLS.length) pushParams({ cols: undefined, page: "1" });
    else pushParams({ cols: list.join(","), page: "1" });
  };

  const visible = (key: ColKey) => visibleCols.has(key);

  const toggleWatch = (ticker: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  };

  const toggleSelected = (ticker: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(ticker);
      else next.delete(ticker);
      return next;
    });
  };

  const allTickersOnPage = React.useMemo(() => rows.map((r) => r.ticker), [rows]);
  const allSelectedOnPage = allTickersOnPage.every((t) => selected.has(t)) && allTickersOnPage.length > 0;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected((prev) => new Set([...prev, ...allTickersOnPage]));
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        allTickersOnPage.forEach((t) => next.delete(t));
        return next;
      });
    }
  };

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          sort,
          dir,
        });
        if (q) params.set("q", q);
        if (issuer) params.set("issuer", issuer);
        if (category) params.set("category", category);

        const res = await fetch(`/api/etfs?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { items: Row[]; total: number } = await res.json();

        let items: Row[] = json.items || [];
        let totalCount: number = json.total || 0;

        if (watchOnly) {
          const wl = watchlist;
          items = items.filter((r) => wl.has(r.ticker));
          totalCount = items.length;
        }

        setRows(items);
        setTotal(totalCount);
        clearSelection(); // clear when data set changes
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load ETFs";
        setError(msg);
        setToast(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
    // We intentionally depend only on URL/filters + watch states.
  }, [q, page, sort, dir, issuer, category, pageSize, watchOnly, watchlist]);

  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < maxPage;

  // Skeleton table (10 rows)
  const skeletonTable = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: 44 }}>
            <Skeleton className="h-4 w-4" />
          </TableHead>
          <TableHead style={{ width: 44 }}>★</TableHead>
          {ALL_COLS.filter((c) => visible(c.key)).map((c) => (
            <TableHead key={c.key}>
              <Skeleton className="h-5 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
            <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
            {ALL_COLS.filter((c) => visible(c.key)).map((c) => (
              <TableCell key={c.key + i}>
                <Skeleton className="h-4 w-[160px]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Compare action: go to /compare?tickers=...
  const compareNow = () => {
    const list = Array.from(selected);
    if (list.length < 2) return;
    router.push(`/compare?tickers=${encodeURIComponent(list.join(","))}`);
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-600">
          {loading ? (
            <Skeleton className="h-4 w-44" />
          ) : (
            <>
              Showing {(rows.length ? (page - 1) * pageSize + 1 : 0)}–
              {(page - 1) * pageSize + rows.length} of {total}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Compare button */}
          <Button
            variant="outline"
            size="sm"
            onClick={compareNow}
            disabled={selected.size < 2}
            title={selected.size < 2 ? "Select at least two tickers" : "Compare selected"}
          >
            Compare ({selected.size})
          </Button>

          {/* Page size selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Rows: {pageSize}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[10, 25, 50].map((n) => (
                <DropdownMenuCheckboxItem
                  key={n}
                  checked={pageSize === n}
                  onCheckedChange={() => setPageSize(n)}
                >
                  {n}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column chooser */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_COLS.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={visible(c.key)}
                  onCheckedChange={(v) => {
                    const next = new Set<ColKey>(visibleCols);
                    if (v) next.add(c.key);
                    else next.delete(c.key);
                    setVisibleCols(next);
                    setColsParam(next);
                  }}
                >
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      {error && !loading && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        skeletonTable
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {/* Select-all checkbox */}
                <TableHead style={{ width: 44 }}>
                  <Checkbox
                    checked={allSelectedOnPage}
                    onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                    aria-label="Select all on page"
                  />
                </TableHead>

                {/* Star header */}
                <TableHead style={{ width: 44 }}>★</TableHead>

                {ALL_COLS.filter((c) => visible(c.key)).map((c) => (
                  <TableHead key={c.key}>
                    {c.sortable ? (
                      <button
                        className="font-semibold hover:underline underline-offset-4"
                        onClick={() => toggleSort(c.key)}
                      >
                        {c.label}{(c.key !== sort ? " " : (dir === "asc" ? " ▲" : " ▼"))}
                      </button>
                    ) : (
                      c.label
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={ALL_COLS.filter((c) => visible(c.key)).length + 2} className="text-center text-neutral-500">
                    No results
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const starred = watchlist.has(r.ticker);
                  const isSel = selected.has(r.ticker);
                  return (
                    <TableRow key={r.id}>
                      {/* Select row */}
                      <TableCell>
                        <Checkbox
                          checked={isSel}
                          onCheckedChange={(v) => toggleSelected(r.ticker, Boolean(v))}
                          aria-label={`Select ${r.ticker}`}
                        />
                      </TableCell>

                      {/* Star */}
                      <TableCell>
                        <button
                          aria-label={starred ? "Remove from watchlist" : "Add to watchlist"}
                          title={starred ? "Remove from watchlist" : "Add to watchlist"}
                          onClick={() => toggleWatch(r.ticker)}
                          className={`text-lg leading-none ${starred ? "text-yellow-500" : "text-neutral-300"} hover:opacity-80`}
                        >
                          ★
                        </button>
                      </TableCell>

                      {visible("ticker") && (
                        <TableCell className="font-medium">
                          <Link className="underline underline-offset-4" href={`/etf/${encodeURIComponent(r.ticker)}`}>
                            {r.ticker}
                          </Link>
                        </TableCell>
                      )}
                      {visible("name") && <TableCell>{r.name}</TableCell>}
                      {visible("issuer") && <TableCell>{r.issuer ?? "—"}</TableCell>}
                      {visible("category") && <TableCell>{r.category ?? "—"}</TableCell>}
                      {visible("expenseBps") && <TableCell>{r.expenseBps ?? "—"}</TableCell>}
                      {visible("aumUSD") && (
                        <TableCell>{typeof r.aumUSD === "number" ? r.aumUSD.toLocaleString() : "—"}</TableCell>
                      )}
                      {visible("inceptionDate") && (
                        <TableCell>{r.inceptionDate ? String(r.inceptionDate).slice(0, 10) : "—"}</TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Paginator */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="text-neutral-600">
              Sorted by {sort} {dir === "asc" ? "↑" : "↓"}
              {q ? ` • Filter “${q}”` : ""}
              {watchOnly ? " • Watchlist only" : ""}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={!canPrev}>
                Prev
              </Button>
              <div className="min-w-16 text-center">
                Page {page} / {maxPage}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={!canNext}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
