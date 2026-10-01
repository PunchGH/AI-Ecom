"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { TrendSearch } from "@/lib/types";
import { getHistory, getSearch, runSearch } from "@/lib/api";
import { momentum } from "@/lib/format";
import { trendTypeInfo } from "@/lib/trendType";
import TopNav from "./TopNav";
import SearchBar from "./SearchBar";
import CompareChart from "./CompareChart";

const SLOT_COUNT = 5;

export default function CompareClient() {
  const params = useSearchParams();
  const [slots, setSlots] = useState<(TrendSearch | null)[]>(Array(SLOT_COUNT).fill(null));
  const [history, setHistory] = useState<TrendSearch[]>([]);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [slotError, setSlotError] = useState<Record<number, string>>({});

  useEffect(() => {
    getHistory(50).then(setHistory).catch(() => {});
  }, []);

  // Prefill slots from ?ids= (arriving from the History page's multi-select).
  useEffect(() => {
    const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, SLOT_COUNT);
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => getSearch(id))).then((results) => {
      setSlots((prev) => {
        const next = [...prev];
        results.forEach((r, i) => {
          if (r) next[i] = r;
        });
        return next;
      });
    });
    // Only run once on mount — slots are user-managed after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usedIds = new Set(slots.filter(Boolean).map((s) => s!.id));

  async function fillFresh(index: number, keyword: string) {
    setLoadingSlot(index);
    setSlotError((e) => ({ ...e, [index]: "" }));
    try {
      const result = await runSearch(keyword);
      setSlots((prev) => {
        const next = [...prev];
        next[index] = result;
        return next;
      });
      setHistory((prev) => [result, ...prev]);
    } catch (e: any) {
      setSlotError((err) => ({ ...err, [index]: e.message || "Search failed." }));
    } finally {
      setLoadingSlot(null);
    }
  }

  function fillFromHistory(index: number, id: string) {
    const found = history.find((s) => s.id === id);
    if (!found) return;
    setSlots((prev) => {
      const next = [...prev];
      next[index] = found;
      return next;
    });
  }

  function clearSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  const filled = slots.filter((s): s is TrendSearch => s !== null);
  const availableHistory = history.filter((s) => !usedIds.has(s.id));

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-2xl font-semibold">Compare products</h1>
        <p className="mt-1 text-sm text-muted">
          Fill up to {SLOT_COUNT} slots — type a fresh keyword or pick from your history.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {slots.map((slot, i) =>
            slot ? (
              <FilledSlot key={i} search={slot} onRemove={() => clearSlot(i)} />
            ) : (
              <EmptySlot
                key={i}
                index={i}
                loading={loadingSlot === i}
                error={slotError[i]}
                historyOptions={availableHistory}
                onSearch={(kw) => fillFresh(i, kw)}
                onPickHistory={(id) => fillFromHistory(i, id)}
              />
            ),
          )}
        </div>

        <div className="mt-8">
          {filled.length === 0 ? (
            <div className="card rounded-2xl border border-line bg-panel p-10 text-center text-sm text-muted">
              Fill a slot above to start comparing.
            </div>
          ) : (
            <CompareChart items={filled} />
          )}
        </div>
      </main>
    </div>
  );
}

function FilledSlot({
  search,
  onRemove,
}: {
  search: TrendSearch;
  onRemove: () => void;
}) {
  const mom = momentum(search.interest_over_time);
  const tone = mom > 5 ? "text-up" : mom < -5 ? "text-down" : "text-muted";
  const trendInfo = trendTypeInfo(search.trend_type);
  return (
    <div className="card rounded-2xl border border-accent bg-accent-soft p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{search.keyword}</div>
          <div className={`text-sm font-medium ${tone}`}>
            {mom > 0 ? "+" : ""}
            {mom}% momentum
          </div>
        </div>
        <button
          onClick={onRemove}
          aria-label={`Remove ${search.keyword} from comparison`}
          className="shrink-0 rounded-lg p-1 text-muted hover:bg-panel2 hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {trendInfo && (
        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${trendInfo.badgeClass}`}
        >
          {trendInfo.label}
        </span>
      )}
      <div className="mt-2 text-xs text-muted">
        avg {search.avg_interest ?? "—"} · peak {search.peak_interest ?? "—"}
      </div>
    </div>
  );
}

function EmptySlot({
  index,
  loading,
  error,
  historyOptions,
  onSearch,
  onPickHistory,
}: {
  index: number;
  loading: boolean;
  error?: string;
  historyOptions: TrendSearch[];
  onSearch: (keyword: string) => void;
  onPickHistory: (id: string) => void;
}) {
  return (
    <div className="card rounded-2xl border border-dashed border-line bg-panel/50 p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
        Slot {index + 1}
      </div>
      <SearchBar size="sm" loading={loading} onSubmit={onSearch} />
      {error && <p className="mt-1 text-xs text-down">{error}</p>}
      {historyOptions.length > 0 && (
        <select
          onChange={(e) => e.target.value && onPickHistory(e.target.value)}
          value=""
          className="mt-2 w-full rounded-lg border border-line bg-panel2 px-2 py-1.5 text-xs text-ink/80 outline-none focus:border-accent"
        >
          <option value="">or pick from your history…</option>
          {historyOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.keyword}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
