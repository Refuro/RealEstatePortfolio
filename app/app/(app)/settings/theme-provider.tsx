"use client";

import { useEffect } from "react";

const STORAGE_KEY = "portfolio-theme";
export type Theme = "light" | "dark" | "system";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

export function setStoredTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = getStoredTheme();
    applyTheme(theme);
  }, []);

  return <>{children}</>;
}
