"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendSearch } from "@/lib/types";
import { momentum, toSeries } from "@/lib/format";
import { trendTypeInfo } from "@/lib/trendType";

// One color per compare slot (max 5) — reuses the app's existing semantic
// tokens as a categorical palette (theme-reactive via CSS vars), since
// there are exactly five of them.
const COLORS = [
  "var(--color-accent)",
  "var(--color-sky)",
  "var(--color-amber)",
  "var(--color-up)",
  "var(--color-down)",
];

export default function CompareChart({ items }: { items: TrendSearch[] }) {
  const seriesList = items.map((it) => toSeries(it.interest_over_time));
  const maxLen = Math.max(0, ...seriesList.map((s) => s.length));

  // Keyed by search id (not keyword) so comparing the same keyword searched
  // twice on different days still shows as two distinct lines.
  const data = Array.from({ length: maxLen }, (_, i) => {
    const row: Record<string, string | number | null> = {
      label: seriesList.find((s) => s[i])?.[i]?.label ?? "",
    };
    items.forEach((it, idx) => {
      row[it.id] = seriesList[idx][i]?.value ?? null;
    });
    return row;
  });

  return (
    <div className="space-y-5">
      <div className="card rounded-2xl border border-line bg-panel p-5">
        <h3 className="mb-4 font-display text-lg font-semibold">Interest over time</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-line)" }}
                minTickGap={28}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 12,
                  color: "var(--color-ink)",
                }}
              />
              <Legend
                formatter={(_value, entry: any) => {
                  const item = items.find((it) => it.id === entry.dataKey);
                  return item?.keyword ?? "";
                }}
                wrapperStyle={{ fontSize: 12, color: "var(--color-ink)" }}
              />
              {items.map((it, idx) => (
                <Line
                  key={it.id}
                  type="monotone"
                  dataKey={it.id}
                  name={it.keyword}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto rounded-2xl border border-line bg-panel p-5">
        <h3 className="mb-4 font-display text-lg font-semibold">Side by side</h3>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <th className="py-2 pr-4 font-medium">Keyword</th>
              <th className="py-2 pr-4 font-medium">Momentum</th>
              <th className="py-2 pr-4 font-medium">Avg</th>
              <th className="py-2 pr-4 font-medium">Peak</th>
              <th className="py-2 pr-4 font-medium">Trend type</th>
              <th className="py-2 font-medium">Top region</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const mom = momentum(it.interest_over_time);
              const tone = mom > 5 ? "text-up" : mom < -5 ? "text-down" : "text-muted";
              const topRegion = it.interest_by_region?.[0];
              const trendInfo = trendTypeInfo(it.trend_type);
              return (
                <tr key={it.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pr-4">
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                      style={{ background: COLORS[idx % COLORS.length] }}
                    />
                    {it.keyword}
                  </td>
                  <td className={`py-2.5 pr-4 font-medium ${tone}`}>
                    {mom > 0 ? "+" : ""}
                    {mom}%
                  </td>
                  <td className="py-2.5 pr-4">{it.avg_interest ?? "—"}</td>
                  <td className="py-2.5 pr-4">{it.peak_interest ?? "—"}</td>
                  <td className="py-2.5 pr-4">
                    {trendInfo ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${trendInfo.badgeClass}`}
                      >
                        {trendInfo.label}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2.5">{topRegion ? topRegion.location : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
