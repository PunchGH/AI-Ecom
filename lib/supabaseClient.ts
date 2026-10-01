import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Single browser client, cookie-aware (so the session is visible to
// middleware and server components too). Used for auth, reading search
// history, and invoking the `trends` edge function.
export const supabase = createBrowserClient(url, anonKey);
