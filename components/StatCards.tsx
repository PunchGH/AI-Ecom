"use client";

import type { TrendSearch } from "@/lib/types";
import { momentum } from "@/lib/format";
import { trendTypeInfo } from "@/lib/trendType";

function Card({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "up" | "down" | "accent" | "amber" | "muted";
}) {
  const toneClass =
    tone === "up"
      ? "text-up"
      : tone === "down"
        ? "text-down"
        : tone === "accent"
          ? "text-accent"
          : tone === "amber"
            ? "text-amber"
            : tone === "muted"
              ? "text-muted"
              : "text-ink";
  return (
    <div className="card rounded-2xl border border-line bg-panel p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`mt-2 font-display text-3xl font-semibold ${toneClass}`}>
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export default function StatCards({ search }: { search: TrendSearch }) {
  const mom = momentum(search.interest_over_time);
  const regions = search.interest_by_region?.length ?? 0;
  const topRegion = search.interest_by_region?.[0];
  const trendInfo = trendTypeInfo(search.trend_type);

  return (
    <div className={`grid grid-cols-2 gap-3 ${trendInfo ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
      <Card
        label="Momentum"
        value={`${mom > 0 ? "+" : ""}${mom}%`}
        hint="last vs first quarter"
        tone={mom > 5 ? "up" : mom < -5 ? "down" : "ink"}
      />
      <Card
        label="Avg interest"
        value={`${search.avg_interest ?? "—"}`}
        hint="0–100 index"
        tone="accent"
      />
      <Card
        label="Peak interest"
        value={`${search.peak_interest ?? "—"}`}
        hint="12-month high"
      />
      <Card
        label="Top region"
        value={topRegion ? topRegion.geo : "—"}
        hint={topRegion ? `${topRegion.location} · ${regions} regions` : "no data"}
      />
      {trendInfo && (
        <Card
          label="Trend type"
          value={trendInfo.label}
          hint={trendInfo.description}
          tone={trendInfo.tone}
        />
      )}
    </div>
  );
}
