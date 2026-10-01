"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TrendSearch } from "@/lib/types";
import { getHistory, deleteSearch } from "@/lib/api";
import { momentum } from "@/lib/format";
import { trendTypeInfo } from "@/lib/trendType";
import TopNav from "./TopNav";

const MAX_COMPARE = 5;

export default function HistoryClient() {
  const router = useRouter();
  const [items, setItems] = useState<TrendSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getHistory(50)
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_COMPARE) {
        next.add(id);
      }
      return next;
    });
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await deleteSearch(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } finally {
      setDeletingId(null);
    }
  }

  function goCompare() {
    const ids = Array.from(selected);
    router.push(`/Compare?ids=${ids.join(",")}`);
  }

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Your search history</h1>
            <p className="mt-1 text-sm text-muted">
              Select up to {MAX_COMPARE} to compare side by side.
            </p>
          </div>
          {selected.size > 0 && (
            <button
              onClick={goCompare}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
            >
              Compare {selected.size} selected
            </button>
          )}
        </div>

        {loading && <p className="text-sm text-muted">Loading…</p>}

        {!loading && items.length === 0 && (
          <div className="card rounded-2xl border border-line bg-panel p-10 text-center">
            <p className="text-sm text-muted">
              No searches yet. Run one from the{" "}
              <a href="/Dashboard" className="text-accent hover:brightness-110">
                Dashboard
              </a>
              .
            </p>
          </div>
        )}

        <ul className="space-y-2">
          {items.map((s) => {
            const mom = momentum(s.interest_over_time);
            const tone = mom > 5 ? "text-up" : mom < -5 ? "text-down" : "text-muted";
            const checked = selected.has(s.id);
            const trendInfo = trendTypeInfo(s.trend_type);
            return (
              <li
                key={s.id}
                className={`card flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  checked ? "border-accent bg-accent-soft" : "border-line bg-panel"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s.id)}
                  disabled={!checked && selected.size >= MAX_COMPARE}
                  className="h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
                  aria-label={`Select ${s.keyword} for comparison`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink">{s.keyword}</div>
                  <div className="text-xs text-muted">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
                </div>
                {trendInfo && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${trendInfo.badgeClass}`}
                    title={trendInfo.description}
                  >
                    {trendInfo.label}
                  </span>
                )}
                <span className={`shrink-0 text-sm font-medium ${tone}`}>
                  {mom > 0 ? "+" : ""}
                  {mom}%
                </span>
                <a
                  href={`/Dashboard?q=${encodeURIComponent(s.keyword)}`}
                  className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm text-ink/80 transition hover:border-accent/50"
                >
                  Open
                </a>
                <button
                  onClick={() => remove(s.id)}
                  disabled={deletingId === s.id}
                  className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm text-ink/60 transition hover:border-down/50 hover:text-down disabled:opacity-50"
                >
                  {deletingId === s.id ? "…" : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
