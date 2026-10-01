"use client";

import type { TrendSearch } from "@/lib/types";
import { momentum } from "@/lib/format";

export default function HistoryRail({
  items,
  activeId,
  onPick,
}: {
  items: TrendSearch[];
  activeId?: string;
  onPick: (s: TrendSearch) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="card rounded-2xl border border-line bg-panel p-4">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
        Recent searches
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => {
          const mom = momentum(s.interest_over_time);
          const tone =
            mom > 5 ? "text-up" : mom < -5 ? "text-down" : "text-muted";
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line bg-panel2 text-ink/80 hover:border-accent/50"
              }`}
            >
              <span className="truncate max-w-[160px]">{s.keyword}</span>
              <span className={`text-xs font-medium ${tone}`}>
                {mom > 0 ? "+" : ""}
                {mom}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
