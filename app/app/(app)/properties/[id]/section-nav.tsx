"use client";

import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "property-details", label: "Property details" },
  { id: "mortgages", label: "Mortgages" },
  { id: "amortization", label: "Amortization" },
] as const;

function scrollToSection(id: string) {
  if (id === "overview") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SectionNav() {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry?.isIntersecting);
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel: placed right after hero; when it scrolls out of view, show nav */}
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {visible && (
      <nav
        className="sticky top-14 z-30 -mx-4 -mt-4 flex items-center border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-0 md:mx-0 md:mt-0 md:rounded-md md:border md:bg-card md:px-4"
        aria-label="Jump to section"
      >
        {/* Desktop: horizontal links */}
        <div className="hidden gap-1 md:flex">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile: Jump to dropdown */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-subtle"
            aria-expanded={mobileOpen}
            aria-haspopup="menu"
          >
            Jump to
            <span className="text-muted">{mobileOpen ? "▲" : "▼"}</span>
          </button>
          {mobileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                aria-hidden
                onClick={() => setMobileOpen(false)}
              />
              <ul
                className="absolute left-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-card py-1 shadow-md"
                role="menu"
              >
                {SECTIONS.map(({ id, label }) => (
                  <li key={id} role="menuitem">
                    <button
                      type="button"
                      onClick={() => {
                        scrollToSection(id);
                        setMobileOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-subtle"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </nav>
      )}
    </>
  );
}
