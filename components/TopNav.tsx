"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ThemeSwitcher from "./ThemeSwitcher";

const LINKS = [
  { href: "/Dashboard", label: "Dashboard" },
  { href: "/History", label: "History" },
  { href: "/Compare", label: "Compare" },
  { href: "/Profile", label: "Profile" },
];

// Shared top bar for the non-Dashboard pages (History, Compare, Profile).
// Dashboard keeps its own header (search bar + assistant toggle) but links
// to the same routes.
export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/SignIn");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/Dashboard" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-display text-lg font-bold text-white">
            S
          </span>
          <span className="hidden font-display text-lg font-semibold sm:block">Signal</span>
        </Link>
        <nav className="flex flex-1 items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-accent-soft text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <ThemeSwitcher />
        <button
          onClick={signOut}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink/80 transition hover:border-down/50 hover:text-down"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
