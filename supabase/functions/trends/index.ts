// Supabase Edge Function: trends
// Deployed to project `tawearmezcvqlwgomktc`. This file is the source of truth —
// redeploy with:  supabase functions deploy trends --project-ref tawearmezcvqlwgomktc
//
// Takes { keyword }, scrapes Google Trends via SERP API (interest over time,
// by region, related queries + topics), computes summary stats, stores one row
// in public.trend_searches, and returns it.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Set via a Supabase secret: supabase secrets set SERP_API_KEY=... --project-ref tawearmezcvqlwgomktc
const SERP_API_KEY = Deno.env.get("SERP_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function serpUrl(keyword: string, dataType: string) {
  const p = new URLSearchParams({
    engine: "google_trends",
    q: keyword,
    data_type: dataType,
    api_key: SERP_API_KEY,
  });
  return `https://serpapi.com/search?${p.toString()}`;
}

async function fetchType(keyword: string, dataType: string) {
  try {
    const res = await fetch(serpUrl(keyword, dataType));
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
}

// Classifies the shape of a 12-month weekly interest series into one of
// five demand patterns. Mirrors lib/format.ts's momentum() exactly — this
// Deno isolate can't import from lib/, so it's intentionally duplicated.
// Keep both in sync if the formula changes.
function classifyTrend(vals: number[]): string | null {
  if (vals.length < 8) return null;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  const stddev = Math.sqrt(variance);
  const cv = mean > 0 ? stddev / mean : 0; // zero-guard — avoids NaN on an all-zero series
  const sorted = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const peak = Math.max(...vals);
  const spike_ratio = peak / Math.max(median, 1);
  const high_weeks_fraction = vals.filter((v) => v >= 0.7 * peak).length / vals.length;

  const chunk = Math.max(1, Math.floor(vals.length / 4));
  const avgOf = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const first = avgOf(vals.slice(0, chunk));
  const last = avgOf(vals.slice(-chunk));
  const momentum =
    first === 0 ? (last > 0 ? 100 : 0) : Math.round(((last - first) / first) * 100);

  // Momentum threshold tuned empirically: real evergreen categories (bikes,
  // shaving machines) commonly show +25-30% momentum from mild in-window
  // seasonal fluctuation despite a low, steady cv — 35% better separates
  // genuine trending/declining moves from that natural noise.
  if (spike_ratio >= 2.5 && high_weeks_fraction <= 0.15) return "seasonal";
  if (momentum >= 35 && cv < 0.6) return "trending";
  if (momentum <= -35 && cv < 0.6) return "declining";
  if (cv <= 0.25) return "evergreen";
  return "volatile";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { keyword } = await req.json();
    if (!keyword || typeof keyword !== "string") {
      return new Response(JSON.stringify({ error: "keyword is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const q = keyword.trim();

    // Resolve the real caller from the forwarded Authorization header.
    // `verify_jwt: true` on this function only proves *a* valid JWT reached
    // us (e.g. the anon key) — it does not tell us which signed-in user is
    // calling, so we ask Supabase Auth directly.
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await callerClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Sign in required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [timeseries, geo, relatedQ, relatedT] = await Promise.all([
      fetchType(q, "TIMESERIES"),
      fetchType(q, "GEO_MAP_0"),
      fetchType(q, "RELATED_QUERIES"),
      fetchType(q, "RELATED_TOPICS"),
    ]);

    const interest_over_time = timeseries?.interest_over_time?.timeline_data ?? [];
    const interest_by_region = geo?.interest_by_region ?? [];
    const related_queries = relatedQ?.related_queries ?? null;
    const related_topics = relatedT?.related_topics ?? null;

    const points: number[] = interest_over_time
      .map((d: any) => d?.values?.[0]?.extracted_value)
      .filter((v: any) => typeof v === "number");
    const peak_interest = points.length ? Math.max(...points) : null;
    const avg_interest = points.length
      ? Math.round((points.reduce((a, b) => a + b, 0) / points.length) * 10) / 10
      : null;
    const trend_type = classifyTrend(points);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("trend_searches")
      .insert({
        keyword: q,
        user_id: user.id,
        interest_over_time,
        interest_by_region,
        related_queries,
        related_topics,
        avg_interest,
        peak_interest,
        trend_type,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
