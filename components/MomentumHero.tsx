"use client";

import type { TrendSearch } from "@/lib/types";
import { momentum, toSeries } from "@/lib/format";
import { trendTypeInfo } from "@/lib/trendType";

// Signature element: a large "is this heating up or cooling down?" readout
// with a hand-drawn sparkline. This is the one thing a product hunter wants.
export default function MomentumHero({ search }: { search: TrendSearch }) {
  const mom = momentum(search.interest_over_time);
  const series = toSeries(search.interest_over_time);
  const trendInfo = trendTypeInfo(search.trend_type);
  const rising = mom > 5;
  const falling = mom < -5;
  const stroke = rising ? "var(--color-up)" : falling ? "var(--color-down)" : "var(--color-muted)";
  const verdict = rising ? "Heating up" : falling ? "Cooling down" : "Holding steady";

  const w = 520;
  const h = 120;
  const vals = series.map((s) => s.value);
  const max = Math.max(1, ...vals);
  const min = Math.min(...vals, 0);
  const span = Math.max(1, max - min);
  const pts = vals.map((v, i) => {
    const x = (i / Math.max(1, vals.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 12) - 6;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1];

  return (
    <div className="card relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-panel2 to-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Demand signal
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
            {search.keyword}
          </h2>
          {trendInfo && (
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${trendInfo.badgeClass}`}
              title={trendInfo.description}
            >
              {trendInfo.label}
            </span>
          )}
        </div>
        <div className="text-right">
          <div
            className="font-display text-4xl font-bold"
            style={{ color: stroke }}
          >
            {mom > 0 ? "+" : ""}
            {mom}%
          </div>
          <div className="text-sm" style={{ color: stroke }}>
            {rising ? "▲ " : falling ? "▼ " : "▬ "}
            {verdict}
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-4 h-28 w-full"
        role="img"
        aria-label={`Interest trend for ${search.keyword}, ${verdict}`}
      >
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark)" />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {last ? <circle cx={last[0]} cy={last[1]} r="3.5" fill={stroke} /> : null}
      </svg>

      <p className="mt-2 text-xs text-muted">
        12-month Google Trends interest (0–100 relative index). Momentum compares
        the most recent quarter to the first.
      </p>
    </div>
  );
}
