// Shapes returned by the SERP google_trends engine and stored in Supabase.

export type TimelinePoint = {
  date: string;
  timestamp: string;
  values: { query: string; value: string; extracted_value: number }[];
};

export type RegionPoint = {
  geo: string;
  location: string;
  value: string;
  extracted_value: number;
};

export type RelatedItem = {
  query?: string;
  topic?: { title: string; type?: string };
  value: string | number;
  extracted_value: number;
  link?: string;
};

export type RelatedGroup = {
  rising?: RelatedItem[];
  top?: RelatedItem[];
};

// One row of public.trend_searches.
export type TrendSearch = {
  id: string;
  user_id: string;
  keyword: string;
  interest_over_time: TimelinePoint[];
  interest_by_region: RegionPoint[];
  related_queries: RelatedGroup | null;
  related_topics: RelatedGroup | null;
  avg_interest: number | null;
  peak_interest: number | null;
  trend_type: string | null;
  created_at: string;
};
