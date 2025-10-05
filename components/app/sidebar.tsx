"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/components/lib/use-debounce";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

type Meta = {
  issuers: string[];
  categories: string[];
};

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

function useMeta(): { meta: Meta; loading: boolean; error: string | null } {
  const [meta, setMeta] = React.useState<Meta>({ issuers: [], categories: [] });
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [iRes, cRes] = await Promise.all([
          fetch("/api/meta/issuers", { cache: "no-store" }),
          fetch("/api/meta/categories", { cache: "no-store" }),
        ]);
        if (!iRes.ok || !cRes.ok) throw new Error("Meta fetch failed");

        const [iJsonUnknown, cJsonUnknown] = await Promise.all([iRes.json(), cRes.json()]);

        const issuers = isStringArray((iJsonUnknown as { issuers?: unknown })?.issuers)
          ? (iJsonUnknown as { issuers: string[] }).issuers
          : [];
        const categories = isStringArray((cJsonUnknown as { categories?: unknown })?.categories)
          ? (cJsonUnknown as { categories: string[] }).categories
          : [];

        if (!aborted) setMeta({ issuers, categories });
      } catch (e: unknown) {
        if (!aborted) {
          const msg = e instanceof Error ? e.message : "Failed to load filters";
          setError(msg);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  return { meta, loading, error };
}

function useParamList(sp: URLSearchParams, key: string) {
  const raw = sp.get(key) || "";
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export function Sidebar() {
  const router = useRouter();
  const sp = useSearchParams();
  const { meta, loading, error } = useMeta();

  const q0 = sp.get("q") || "";
  const [q, setQ] = React.useState<string>(q0);
  const debounced = useDebounce(q, 350);

  const issuerSelected = useParamList(sp, "issuer");
  const categorySelected = useParamList(sp, "category");
  const watchOnly = sp.get("watch") === "1";

  React.useEffect(() => {
    setQ(q0);
  }, [q0]);

  // Search updates
  React.useEffect(() => {
    const params = new URLSearchParams(sp.toString());
    if (debounced) params.set("q", debounced);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/etfs?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const toggleListParam = (key: "issuer" | "category", value: string, checked: boolean) => {
    const params = new URLSearchParams(sp.toString());
    const current = (params.get(key) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const set = new Set(current);
    if (checked) set.add(value);
    else set.delete(value);

    const next = Array.from(set);
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);

    params.set("page", "1");
    router.push(`/etfs?${params.toString()}`);
  };

  const toggleWatchOnly = (checked: boolean) => {
    const params = new URLSearchParams(sp.toString());
    if (checked) params.set("watch", "1");
    else params.delete("watch");
    params.set("page", "1");
    router.push(`/etfs?${params.toString()}`);
  };

  const isChecked = (arr: string[], v: string) => arr.includes(v);

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <div>
        <div className="font-medium mb-2">Filters</div>
        <div className="text-xs text-neutral-500 mb-3">Search by ticker, name, or issuer</div>
        <Input
          placeholder="Search tickers or names…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Separator />

      <div>
        <div className="font-medium mb-2">Watchlist</div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={watchOnly} onCheckedChange={(v) => toggleWatchOnly(Boolean(v))} />
          <span>Show only ⭐ starred</span>
        </label>
      </div>

      <Separator />

      <div>
        <div className="font-medium mb-2">Issuer</div>
        <div className="max-h-48 overflow-auto pr-1 space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </>
          ) : error ? (
            <div className="text-xs text-red-600">Failed to load issuers</div>
          ) : meta.issuers.length === 0 ? (
            <div className="text-xs text-neutral-500">—</div>
          ) : (
            meta.issuers.map((name) => (
              <label key={name} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isChecked(issuerSelected, name)}
                  onCheckedChange={(v) => toggleListParam("issuer", name, Boolean(v))}
                />
                <span className="truncate">{name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <Separator />

      <div>
        <div className="font-medium mb-2">Category</div>
        <div className="max-h-48 overflow-auto pr-1 space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : error ? (
            <div className="text-xs text-red-600">Failed to load categories</div>
          ) : meta.categories.length === 0 ? (
            <div className="text-xs text-neutral-500">—</div>
          ) : (
            meta.categories.map((name) => (
              <label key={name} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isChecked(categorySelected, name)}
                  onCheckedChange={(v) => toggleListParam("category", name, Boolean(v))}
                />
                <span className="truncate">{name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        Tip: combine search + filters; URL stays shareable.
      </div>
    </div>
  );
}
