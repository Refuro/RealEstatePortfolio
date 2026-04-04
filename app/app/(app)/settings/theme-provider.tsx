"use client";

import { useEffect } from "react";

const STORAGE_KEY = "portfolio-theme";
export type Theme = "light" | "dark" | "system";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "system";
  } catch {
    // Safari private mode, cross-origin restrictions, or SecurityError (DOMException 18)
    return "system";
  }
}

export function setStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* same cases as getStoredTheme */
  }
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
