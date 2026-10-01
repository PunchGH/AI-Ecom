# Signal — Product Trend Intelligence

Search a product keyword → scrape 12 months of Google Trends (via SERP API) →
store in Supabase → read the **demand signal** on a dashboard with an embedded
AI assistant.

## Stack
- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Recharts** for charts
- **Supabase** — Postgres table `trend_searches` + Edge Function `trends`
- **OpenAI** (`gpt-4o-mini`) for the sliding assistant

## How it works
```
Home (search) ─▶ /Dashboard?q=<keyword>
                   │
                   ├─ supabase.functions.invoke('trends')   ← Edge Function
                   │     scrapes SERP google_trends, saves a row, returns it
                   │
                   ├─ charts: momentum hero, interest-over-time, region, related
                   └─ Assistant panel ─▶ /api/agent ─▶ OpenAI (grounded in the data)
```

## Run it
```bash
npm install
npm run dev          # http://localhost:3000
```
Environment lives in `.env.local` (already populated):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client
- `NEXT_OPENAI_API_KEY` — used only server-side by `/api/agent`

The **SERP API key stays inside the Edge Function** (server-side), not in the app.

## Supabase (already deployed)
- Project ref: `tawearmezcvqlwgomktc`
- Table `trend_searches` — created via migration.
- Edge Function `trends` — deployed and live.

### Recommended hardening
The Edge Function currently falls back to an inline SERP key so it works out of
the box. Move it to a secret when convenient:
```bash
supabase secrets set SERP_API_KEY=<your-serp-key> --project-ref tawearmezcvqlwgomktc
```
Then delete the inline fallback in `supabase/functions/trends/index.ts`.

## Notes
- Google Trends "interest" is a **0–100 relative index**, not sales volume.
- Each dashboard load runs a fresh SERP scrape (~10–15s) and saves a new row.
  Recent searches appear in the history rail for instant re-open (no re-scrape).

## Structure
```
app/
  globals.css
  layout.tsx
  page.tsx              # Home
  Dashboard/page.tsx    # Dashboard (Suspense wrapper)
  api/agent/route.ts    # OpenAI assistant endpoint
components/             # SearchBar, MomentumHero, charts, RelatedList, AgentPanel, ...
lib/                    # supabaseClient, api, types, format
supabase/functions/trends/index.ts   # reference copy of the deployed Edge Function
```
