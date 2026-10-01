import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Handles Supabase email links (signup confirmation + password recovery).
// Exchanges the `code` param for a session, then routes onward.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/ResetPassword?recovery=1`);
  }

  return NextResponse.redirect(`${origin}/Dashboard`);
}
