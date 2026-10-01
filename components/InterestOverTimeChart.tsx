"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimelinePoint } from "@/lib/types";
import { toSeries } from "@/lib/format";

export default function InterestOverTimeChart({
  points,
}: {
  points: TimelinePoint[];
}) {
  const data = toSeries(points);

  return (
    <div className="card rounded-2xl border border-line bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Interest over time</h3>
        <span className="text-xs text-muted">last 12 months</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              labelFormatter={(_l: unknown, p: any) =>
                p?.[0]?.payload?.fullLabel ?? _l
              }
              formatter={(v: unknown) => [`${v} / 100`, "Interest"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              fill="url(#fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
