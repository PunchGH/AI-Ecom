import type { TrendSearch, TimelinePoint } from "./types";

// Turn a raw timeline point into a compact { label, value } for charts.
export function toSeries(points: TimelinePoint[] = []) {
  return points.map((p) => ({
    label: shortDate(p.date),
    fullLabel: p.date,
    value: p.values?.[0]?.extracted_value ?? 0,
  }));
}

// "Jul 6 – 12, 2025" -> "Jul 6"
function shortDate(date: string) {
  const m = date.match(/^([A-Za-z]{3} \d{1,2})/);
  return m ? m[1] : date;
}

// Compare the average of the last quarter of the series to the first quarter.
// Returns a signed percentage — the momentum readout that drives the UI.
export function momentum(points: TimelinePoint[] = []) {
  const vals = points
    .map((p) => p.values?.[0]?.extracted_value ?? 0)
    .filter((v) => typeof v === "number");
  if (vals.length < 4) return 0;
  const chunk = Math.max(1, Math.floor(vals.length / 4));
  const first = avg(vals.slice(0, chunk));
  const last = avg(vals.slice(-chunk));
  if (first === 0) return last > 0 ? 100 : 0;
  return Math.round(((last - first) / first) * 100);
}

function avg(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

// A short natural-language summary of a search — fed to the AI agent so it
// can answer questions about whatever is on screen.
export function summarize(s: TrendSearch | null): string {
  if (!s) return "No search has been run yet.";
  const mom = momentum(s.interest_over_time);
  const dir = mom > 5 ? "rising" : mom < -5 ? "falling" : "flat";
  const regions = (s.interest_by_region ?? [])
    .slice(0, 5)
    .map((r) => `${r.location} (${r.extracted_value})`)
    .join(", ");
  const rising = (s.related_queries?.rising ?? [])
    .slice(0, 5)
    .map((r) => r.query)
    .filter(Boolean)
    .join(", ");
  const top = (s.related_queries?.top ?? [])
    .slice(0, 5)
    .map((r) => r.query)
    .filter(Boolean)
    .join(", ");

  return [
    `Keyword: "${s.keyword}"`,
    `Search interest is ${dir} (${mom > 0 ? "+" : ""}${mom}% momentum, last vs first quarter of the 12-month window).`,
    `Average interest: ${s.avg_interest ?? "n/a"} / 100. Peak: ${s.peak_interest ?? "n/a"} / 100.`,
    regions ? `Top regions by interest: ${regions}.` : "",
    rising ? `Rising related queries: ${rising}.` : "",
    top ? `Top related queries: ${top}.` : "",
    `Note: Google Trends interest is a 0-100 relative index, not sales volume.`,
  ]
    .filter(Boolean)
    .join("\n");
}
