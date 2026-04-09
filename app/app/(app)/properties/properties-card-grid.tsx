"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";
import { useIsMobile } from "@/lib/use-is-mobile";

type PropertiesCardGridProps = {
  cards: ReactNode[];
  listRows: ReactNode[];
  totalCount: number;
  isMobileDisclosureEligible: boolean;
  viewMode: "grid" | "list";
};

const MOBILE_INITIAL_COUNT = 6;

export function PropertiesCardGrid({
  cards,
  listRows,
  totalCount,
  isMobileDisclosureEligible,
  viewMode: serverViewMode,
}: PropertiesCardGridProps) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  // Local view state — initialised from server (URL param), but toggles instantly
  // without a server round-trip. URL is kept in sync silently via history.replaceState.
  const [view, setView] = useState<"grid" | "list">(serverViewMode);

  // Sync when server-resolved value changes (e.g. after filter/sort navigation)
  useEffect(() => { setView(serverViewMode); }, [serverViewMode]);

  useEffect(() => {
    if (!isMobile) setExpanded(true);
  }, [isMobile]);

  function switchView(next: "grid" | "list") {
    setView(next);
    // Silently update URL so filter/sort navigations carry the current view,
    // without triggering a server re-render.
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("view", next);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // no-op in environments where history is unavailable
    }
  }

  const shouldCollapse = view === "grid" && isMobileDisclosureEligible && !expanded;
  const visibleCards = shouldCollapse ? cards.slice(0, MOBILE_INITIAL_COUNT) : cards;

  const segBtnBase =
    "inline-flex h-8 w-8 items-center justify-center transition-all duration-150";
  const segActive = "bg-accent/10 text-foreground";
  const segInactive =
    "bg-transparent text-muted hover:bg-subtle hover:text-foreground";

  return (
    <div>
      {/* View toggle — floats above the list, right-aligned */}
      <div className="mb-3 flex items-center justify-end">
        <div className="flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            onClick={() => switchView("grid")}
            className={`${segBtnBase} ${view === "grid" ? segActive : segInactive}`}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid className="size-3.5" aria-hidden />
          </button>
          <span className="w-px bg-border" aria-hidden />
          <button
            type="button"
            onClick={() => switchView("list")}
            className={`${segBtnBase} ${view === "list" ? segActive : segInactive}`}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <List className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards}
        </ul>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {listRows}
        </ul>
      )}

      {shouldCollapse && (
        <div className="mt-4 flex justify-center md:hidden">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
          >
            Show all {totalCount} properties
          </button>
        </div>
      )}
    </div>
  );
}
