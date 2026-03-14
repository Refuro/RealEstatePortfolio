"use client";

import { useState, useEffect } from "react";
import {
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  type Theme,
} from "./theme-provider";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined" ? getStoredTheme() : "system"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentional: avoid hydration mismatch by deferring UI until client mount
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted flag for client-only render
    setMounted(true);
  }, []);

  function handleChange(newTheme: Theme) {
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-subtle/50 px-3 py-2 text-sm text-muted">
        Theme: —
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted">Theme</span>
      <div
        className="flex rounded-md border border-border bg-subtle/50 p-0.5"
        role="radiogroup"
        aria-label="Theme preference"
      >
        {(["light", "dark", "system"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={theme === opt}
            onClick={() => handleChange(opt)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              theme === opt
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground hover:bg-subtle"
            }`}
          >
            {opt === "light" ? "Light" : opt === "dark" ? "Dark" : "System"}
          </button>
        ))}
      </div>
    </div>
  );
}
