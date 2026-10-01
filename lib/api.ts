import { supabase } from "./supabaseClient";
import type { TrendSearch } from "./types";

// Run a new keyword search. Calls the `trends` edge function, which scrapes
// Google Trends via SERP API, stores the result, and returns the saved row.
export async function runSearch(keyword: string): Promise<TrendSearch> {
  const { data, error } = await supabase.functions.invoke("trends", {
    body: { keyword },
  });
  if (error) throw new Error(error.message);
  if (!data?.data) throw new Error(data?.error || "No data returned.");
  return data.data as TrendSearch;
}

// Recent searches for the history rail.
export async function getHistory(limit = 12): Promise<TrendSearch[]> {
  const { data, error } = await supabase
    .from("trend_searches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as TrendSearch[];
}

// Load a single saved search by id (used when opening one from history).
export async function getSearch(id: string): Promise<TrendSearch | null> {
  const { data, error } = await supabase
    .from("trend_searches")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as TrendSearch;
}

// Delete one of the caller's own saved searches (RLS restricts this to rows
// the caller owns, so no extra guard is needed here).
export async function deleteSearch(id: string): Promise<void> {
  const { error } = await supabase.from("trend_searches").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
