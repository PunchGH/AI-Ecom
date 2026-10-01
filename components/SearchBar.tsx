"use client";

import { useState } from "react";

export default function SearchBar({
  defaultValue = "",
  loading = false,
  size = "lg",
  onSubmit,
}: {
  defaultValue?: string;
  loading?: boolean;
  size?: "lg" | "sm";
  onSubmit: (keyword: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const big = size === "lg";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const k = value.trim();
    if (k && !loading) onSubmit(k);
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={`flex items-center gap-2 rounded-2xl border border-line bg-panel/80 backdrop-blur ${
          big ? "p-2 pl-5" : "p-1.5 pl-4"
        } focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft transition`}
      >
        <svg
          className={`${big ? "h-5 w-5" : "h-4 w-4"} shrink-0 text-muted`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search a product keyword — e.g. wireless earbuds"
          aria-label="Product keyword"
          className={`flex-1 bg-transparent outline-none placeholder:text-muted/70 ${
            big ? "text-lg" : "text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`shrink-0 rounded-xl bg-accent font-medium text-white transition hover:brightness-110 disabled:opacity-60 ${
            big ? "px-5 py-3 text-base" : "px-3.5 py-2 text-sm"
          }`}
        >
          {loading ? "Scanning…" : "Analyze"}
        </button>
      </div>
    </form>
  );
}
