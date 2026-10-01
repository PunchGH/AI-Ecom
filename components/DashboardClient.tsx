"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { TrendSearch } from "@/lib/types";
import { runSearch, getHistory } from "@/lib/api";
import { summarize } from "@/lib/format";
import { supabase } from "@/lib/supabaseClient";
import SearchBar from "./SearchBar";
import StatCards from "./StatCards";
import MomentumHero from "./MomentumHero";
import InterestOverTimeChart from "./InterestOverTimeChart";
import RegionChart from "./RegionChart";
import RelatedList from "./RelatedList";
import HistoryRail from "./HistoryRail";
import AgentPanel from "./AgentPanel";
import ThemeSwitcher from "./ThemeSwitcher";

export default function DashboardClient() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  const [search, setSearch] = useState<TrendSearch | null>(null);
  const [history, setHistory] = useState<TrendSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const lastFetched = useRef<string>("");

  const loadHistory = useCallback(() => {
    getHistory().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Fetch whenever the ?q= in the URL changes to a new keyword.
  useEffect(() => {
    const kw = q.trim();
    if (!kw || kw === lastFetched.current) return;
    lastFetched.current = kw;
    setLoading(true);
    setError(null);
    runSearch(kw)
      .then((s) => {
        setSearch(s);
        loadHistory();
      })
      .catch((e) => setError(e.message || "Search failed."))
      .finally(() => setLoading(false));
  }, [q, loadHistory]);

  function submit(keyword: string) {
    router.replace(`/Dashboard?q=${encodeURIComponent(keyword)}`);
  }

  function pickHistory(s: TrendSearch) {
    lastFetched.current = s.keyword;
    setSearch(s);
    setError(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/SignIn");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-base/80 backdrop-blur-xl">
        <div
          className={`mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 transition-[margin] duration-300 ${
            agentOpen ? "lg:mr-[380px]" : ""
          }`}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-display text-lg font-bold text-white">
              S
            </span>
            <span className="hidden font-display text-lg font-semibold sm:block">
              Signal
            </span>
          </Link>
          <nav className="hidden shrink-0 items-center gap-1 md:flex">
            <Link href="/History" className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:text-ink">
              History
            </Link>
            <Link href="/Compare" className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:text-ink">
              Compare
            </Link>
            <Link href="/Profile" className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:text-ink">
              Profile
            </Link>
          </nav>
          <div className="flex-1">
            <SearchBar size="sm" defaultValue={q} loading={loading} onSubmit={submit} />
          </div>
          <button
            onClick={() => setAgentOpen((o) => !o)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              agentOpen
                ? "border-accent bg-accent-soft text-ink"
                : "border-line bg-panel text-ink/85 hover:border-accent/50"
            }`}
            aria-pressed={agentOpen}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="10" width="14" height="10" rx="3" />
              <path d="M12 3v3M9 15h.01M15 15h.01" />
            </svg>
            <span className="hidden sm:block">Assistant</span>
          </button>
          <ThemeSwitcher />
          <button
            onClick={signOut}
            className="hidden shrink-0 rounded-xl border border-line px-3 py-2 text-sm text-ink/80 transition hover:border-down/50 hover:text-down md:block"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content — shifts left when the assistant is docked (push behaviour) */}
      <main
        className={`mx-auto max-w-6xl px-4 py-6 transition-[margin] duration-300 ${
          agentOpen ? "lg:mr-[380px]" : ""
        }`}
      >
        {history.length > 0 && (
          <div className="mb-5">
            <HistoryRail items={history} activeId={search?.id} onPick={pickHistory} />
          </div>
        )}

        {loading && !search && <LoadingState keyword={q} />}
        {error && <ErrorState message={error} />}

        {!loading && !error && !search && !q && <EmptyState onSubmit={submit} />}

        {search && (
          <div className={`space-y-5 ${loading ? "opacity-50" : "rise"}`}>
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <MomentumHero search={search} />
              <div className="flex items-stretch">
                <div className="w-full self-center">
                  <StatCards search={search} />
                </div>
              </div>
            </div>

            <InterestOverTimeChart points={search.interest_over_time} />

            <div className="grid gap-5 lg:grid-cols-2">
              <RegionChart regions={search.interest_by_region} />
              <RelatedList
                title="Related searches"
                group={search.related_queries}
                hint="queries"
              />
            </div>

            <RelatedList
              title="Related topics"
              group={search.related_topics}
              hint="topics"
            />
          </div>
        )}
      </main>

      {/* Dim overlay on mobile when the drawer is open */}
      {agentOpen && (
        <button
          aria-label="Close assistant"
          onClick={() => setAgentOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <AgentPanel
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        context={summarize(search)}
        keyword={search?.keyword ?? null}
      />
    </div>
  );
}

function LoadingState({ keyword }: { keyword: string }) {
  return (
    <div className="card grid place-items-center rounded-2xl border border-line bg-panel py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      <p className="mt-4 text-sm text-muted">
        Scraping Google Trends for{" "}
        <span className="text-ink">“{keyword}”</span>…
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-down/40 bg-down/10 p-5 text-sm text-down">
      <div className="font-medium">Couldn’t complete that search.</div>
      <div className="mt-1 text-down/80">{message}</div>
    </div>
  );
}

function EmptyState({ onSubmit }: { onSubmit: (k: string) => void }) {
  return (
    <div className="card rounded-2xl border border-line bg-panel p-10 text-center">
      <h2 className="font-display text-2xl font-semibold">Start with a keyword</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Search a product above to pull its demand signal — momentum, regional
        heat, and rising related searches.
      </p>
      <div className="mx-auto mt-6 max-w-md">
        <SearchBar size="lg" onSubmit={onSubmit} />
      </div>
    </div>
  );
}
