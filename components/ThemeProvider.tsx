"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "executive" | "ops" | "stealth";
export type Mode = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  setTheme: (t: Theme) => void;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "signal:theme";
const MODE_KEY = "signal:mode";

function isTheme(v: string | null): v is Theme {
  return v === "executive" || v === "ops" || v === "stealth";
}
function isMode(v: string | null): v is Mode {
  return v === "light" || v === "dark";
}

// Two independent switches: theme (Executive/Ops/Stealth) and mode
// (light/dark). The inline script in app/layout.tsx already applies the
// persisted choice to <html> before first paint — this provider just reads
// that back into React state so components can react to it.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("ops");
  const [mode, setModeState] = useState<Mode>("dark");

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    const m = document.documentElement.getAttribute("data-mode");
    if (isTheme(t)) setThemeState(t);
    if (isMode(m)) setModeState(m);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(THEME_KEY, t);
  }

  function setMode(m: Mode) {
    setModeState(m);
    document.documentElement.setAttribute("data-mode", m);
    localStorage.setItem(MODE_KEY, m);
  }

  function toggleMode() {
    setMode(mode === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
