"use client";

import type { RelatedGroup, RelatedItem } from "@/lib/types";

function label(it: RelatedItem) {
  return it.query ?? it.topic?.title ?? "—";
}

function Row({ it }: { it: RelatedItem }) {
  const breakout = String(it.value).toLowerCase() === "breakout";
  const val = breakout
    ? "Breakout"
    : typeof it.value === "number"
      ? `+${it.value}%`
      : it.value;
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line/60 py-2 last:border-0">
      <span className="truncate text-sm text-ink/90">{label(it)}</span>
      <span
        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
          breakout ? "bg-up/15 text-up" : "bg-accent-soft text-accent"
        }`}
      >
        {val}
      </span>
    </li>
  );
}

export default function RelatedList({
  title,
  group,
  hint,
}: {
  title: string;
  group: RelatedGroup | null;
  hint?: string;
}) {
  const rising = group?.rising ?? [];
  const top = group?.top ?? [];

  return (
    <div className="card rounded-2xl border border-line bg-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </div>

      {rising.length === 0 && top.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No related data.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-up">
              Rising
            </div>
            <ul>
              {rising.slice(0, 8).map((it, i) => (
                <Row key={i} it={it} />
              ))}
              {rising.length === 0 && (
                <li className="py-2 text-sm text-muted">—</li>
              )}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
              Top
            </div>
            <ul>
              {top.slice(0, 8).map((it, i) => (
                <Row key={i} it={it} />
              ))}
              {top.length === 0 && <li className="py-2 text-sm text-muted">—</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
