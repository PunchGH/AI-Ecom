// Shared label/tone map for the trend_type values computed server-side by
// the `trends` edge function (see supabase/functions/trends/index.ts).

export type TrendType = "evergreen" | "seasonal" | "trending" | "declining" | "volatile";
export type Tone = "accent" | "amber" | "up" | "down" | "muted";

// Literal class strings (not runtime-interpolated) so Tailwind's static
// scanner can actually find and generate them.
const BADGE_CLASSES: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent",
  amber: "bg-amber/15 text-amber",
  up: "bg-up/15 text-up",
  down: "bg-down/15 text-down",
  muted: "bg-line text-muted",
};

// Same tones, as plain text-color classes (for contexts like StatCards'
// existing tone-driven big-number display).
const TEXT_CLASSES: Record<Tone, string> = {
  accent: "text-accent",
  amber: "text-amber",
  up: "text-up",
  down: "text-down",
  muted: "text-muted",
};

export const TREND_TYPES: Record<
  TrendType,
  { label: string; tone: Tone; badgeClass: string; textClass: string; description: string }
> = {
  evergreen: {
    label: "Evergreen",
    tone: "accent",
    badgeClass: BADGE_CLASSES.accent,
    textClass: TEXT_CLASSES.accent,
    description: "Steady interest year-round",
  },
  seasonal: {
    label: "Seasonal",
    tone: "amber",
    badgeClass: BADGE_CLASSES.amber,
    textClass: TEXT_CLASSES.amber,
    description: "Spikes at a specific time of year",
  },
  trending: {
    label: "Trending",
    tone: "up",
    badgeClass: BADGE_CLASSES.up,
    textClass: TEXT_CLASSES.up,
    description: "Sustained rise in interest",
  },
  declining: {
    label: "Declining",
    tone: "down",
    badgeClass: BADGE_CLASSES.down,
    textClass: TEXT_CLASSES.down,
    description: "Sustained drop in interest",
  },
  volatile: {
    label: "Volatile",
    tone: "muted",
    badgeClass: BADGE_CLASSES.muted,
    textClass: TEXT_CLASSES.muted,
    description: "No clear seasonal or momentum pattern",
  },
};

export function trendTypeInfo(trend_type: string | null) {
  if (!trend_type || !(trend_type in TREND_TYPES)) return null;
  return TREND_TYPES[trend_type as TrendType];
}
