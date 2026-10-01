"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";

const EXAMPLES = ["stanley cup", "air fryer", "led strip lights", "matcha", "car vacuum"];

export default function Home() {
  const router = useRouter();

  function go(keyword: string) {
    router.push(`/Dashboard?q=${encodeURIComponent(keyword)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
      <div className="rise w-full text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-up" />
          Live Google Trends · SERP API
        </div>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Read the{" "}
          <span className="text-accent">demand signal</span>
          <br />
          before you stock it.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted">
          Type any product keyword. We scrape 12 months of Google Trends,
          measure its momentum, and map where the demand lives — so you bet on
          products that are heating up, not cooling down.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <SearchBar size="lg" onSubmit={go} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted">Try:</span>
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => go(e)}
              className="rounded-full border border-line bg-panel2 px-3 py-1 text-ink/80 transition hover:border-accent/50 hover:text-ink"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
