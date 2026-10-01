"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Is this a good product to sell right now?",
  "Which region should I target first?",
  "Summarize the demand signal in 3 bullets",
];

export default function AgentPanel({
  open,
  onClose,
  context,
  keyword,
}: {
  open: boolean;
  onClose: () => void;
  context: string;
  keyword: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      const data = await res.json();
      const reply =
        data.reply ?? data.error ?? "Something went wrong. Try again.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error — is the dev server running?" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      className={`fixed right-0 top-0 z-40 flex h-full w-full flex-col border-l border-line bg-panel/95 backdrop-blur-xl transition-transform duration-300 sm:w-[380px] ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v3M5 8l2 2M19 8l-2 2" />
              <rect x="5" y="10" width="14" height="10" rx="3" />
              <path d="M9 15h.01M15 15h.01" />
            </svg>
          </span>
          <div>
            <div className="font-display text-sm font-semibold leading-tight">
              Signal Assistant
            </div>
            <div className="text-[11px] text-muted">
              {keyword ? `context: “${keyword}”` : "no search loaded"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close assistant"
          className="rounded-lg p-1.5 text-muted hover:bg-panel2 hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="mt-4 text-sm text-muted">
            <p>
              Ask about the current dashboard. I can read the momentum, regions,
              and related searches for{" "}
              <span className="text-ink">{keyword ?? "your keyword"}</span>.
            </p>
            <div className="mt-4 space-y-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={!keyword}
                  className="block w-full rounded-xl border border-line bg-panel2 px-3 py-2 text-left text-sm text-ink/85 transition hover:border-accent/50 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-accent text-white"
                  : "bg-panel2 text-ink/90"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
        {busy && (
          <div className="w-16 rounded-2xl bg-panel2 px-3.5 py-3">
            <span className="flex gap-1">
              <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
              <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
              <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-line bg-panel2 p-1.5 pl-3 focus-within:border-accent">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={keyword ? "Ask the assistant…" : "Run a search first"}
            disabled={!keyword || busy}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70"
          />
          <button
            type="submit"
            disabled={!keyword || busy}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </aside>
  );
}
