"use client";

import { useTheme, type Theme } from "./ThemeProvider";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "ops", label: "Ops" },
  { value: "executive", label: "Executive" },
  { value: "stealth", label: "Stealth" },
];

// Shared by TopNav.tsx and DashboardClient.tsx's own header — one theme
// dropdown + one light/dark toggle, both backed by useTheme().
export default function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useTheme();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        aria-label="Theme"
        className="rounded-lg border border-line bg-panel2 px-2 py-1.5 text-sm text-ink/85 outline-none focus:border-accent"
      >
        {THEME_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        onClick={toggleMode}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-panel2 text-ink/80 transition hover:border-accent/50"
      >
        {mode === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
