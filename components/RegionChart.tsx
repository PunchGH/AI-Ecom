"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RegionPoint } from "@/lib/types";

export default function RegionChart({ regions }: { regions: RegionPoint[] }) {
  const data = (regions ?? [])
    .slice()
    .sort((a, b) => b.extracted_value - a.extracted_value)
    .slice(0, 10)
    .map((r) => ({ name: r.location, geo: r.geo, value: r.extracted_value }));

  // Sequential accent ramp — darker = stronger interest (single-hue, ordered).
  // color-mix with the theme's --color-accent keeps this reactive to theme changes.
  const shade = (i: number) => {
    const t = 1 - i / Math.max(1, data.length - 1);
    const pct = Math.round((0.35 + t * 0.55) * 100);
    return `color-mix(in srgb, var(--color-accent) ${pct}%, transparent)`;
  };

  return (
    <div className="card rounded-2xl border border-line bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Interest by region</h3>
        <span className="text-xs text-muted">top {data.length}</span>
      </div>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No regional data.</p>
      ) : (
        <div style={{ height: data.length * 34 + 10 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={116}
                tick={{ fill: "var(--color-ink)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "color-mix(in srgb, var(--color-ink) 6%, transparent)" }}
                contentStyle={{
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 12,
                  color: "var(--color-ink)",
                }}
                formatter={(v) => [`${v} / 100`, "Interest"]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                {data.map((_, i) => (
                  <Cell key={i} fill={shade(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
