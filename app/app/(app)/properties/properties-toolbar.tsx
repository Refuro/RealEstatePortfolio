"use client";

import { useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutGrid, List } from "lucide-react";
import {
  PROPERTIES_VIEW_EVENT,
  dispatchPropertiesViewEvent,
  type PropertiesViewEventDetail,
} from "./properties-view-event";

type PropertiesFilter = "all" | "incomplete" | "cf_negative" | "refi_ready";
type PropertiesSort = "updated" | "cash_flow" | "cap_rate" | "value_equity";
type PropertiesView = "grid" | "list";

type Option = { key: string; label: string };

type PropertiesToolbarProps = {
  activeFilter: PropertiesFilter;
  activeSort: PropertiesSort;
  activeView: PropertiesView;
  filterOptions: Option[];
  sortOptions: Option[];
};

function buildPropertiesHref(
  filter: PropertiesFilter,
  sort: PropertiesSort,
  view: PropertiesView
): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (sort !== "updated") params.set("sort", sort);
  params.set("view", view);
  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

export function PropertiesToolbar({
  activeFilter: serverFilter,
  activeSort: serverSort,
  activeView,
  filterOptions,
  sortOptions,
}: PropertiesToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filter, setFilter] = useState<PropertiesFilter>(serverFilter);
  const [sort, setSort] = useState<PropertiesSort>(serverSort);
  const [view, setView] = useState<PropertiesView>(activeView);

  useEffect(() => { setFilter(serverFilter); }, [serverFilter]);
  useEffect(() => { setSort(serverSort); }, [serverSort]);
  useEffect(() => { setView(activeView); }, [activeView]);

  // Stay in sync if the toggle is changed elsewhere (defense-in-depth — the
  // toolbar is the only producer today).
  useEffect(() => {
    function onView(e: Event) {
      const detail = (e as CustomEvent<PropertiesViewEventDetail>).detail;
      if (detail?.view) setView(detail.view);
    }
    window.addEventListener(PROPERTIES_VIEW_EVENT, onView);
    return () => window.removeEventListener(PROPERTIES_VIEW_EVENT, onView);
  }, []);

  function switchView(next: PropertiesView) {
    setView(next);
    dispatchPropertiesViewEvent(next);
  }

  function navigate(newFilter: PropertiesFilter, newSort: PropertiesSort) {
    setFilter(newFilter);
    setSort(newSort);
    startTransition(() => {
      router.push(buildPropertiesHref(newFilter, newSort, activeView));
    });
  }

  const chipBase =
    "shrink-0 rounded-full border px-3 py-1 text-sm transition-all duration-150";
  const chipActive =
    "border-accent bg-accent/10 font-semibold text-foreground";
  const chipInactive =
    "border-border bg-transparent font-medium text-muted hover:bg-subtle hover:text-foreground";

  return (
    <div
      className={`transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      {/* Mobile: horizontal-scroll chip row + sort dropdown */}
      <div className="md:hidden">
        <div
          className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {filterOptions.map((option) => {
            const active = filter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => navigate(option.key as PropertiesFilter, sort)}
                className={`${chipBase} ${active ? chipActive : chipInactive}`}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={sort}
              onChange={(e) => navigate(filter, e.target.value as PropertiesSort)}
              className="min-h-[44px] w-full appearance-none rounded-xl border border-border bg-background py-2.5 pl-3 pr-10 text-base font-medium text-foreground"
              aria-label="Sort properties"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
          </div>
          {(filter !== "all" || sort !== "updated") && (
            <button
              type="button"
              onClick={() => navigate("all", "updated")}
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 py-1 text-xs font-medium text-muted transition-all duration-150 hover:bg-subtle hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {filterOptions.map((option) => {
            const active = filter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => navigate(option.key as PropertiesFilter, sort)}
                className={`${chipBase} ${active ? chipActive : chipInactive}`}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center gap-3 border-t border-border pt-2">
          <span className="shrink-0 text-xs font-medium text-muted">Sort</span>
          {sortOptions.map((option) => {
            const active = sort === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => navigate(filter, option.key as PropertiesSort)}
                className={`${chipBase} ${active ? chipActive : chipInactive}`}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {(filter !== "all" || sort !== "updated") && (
              <button
                type="button"
                onClick={() => navigate("all", "updated")}
                className="shrink-0 text-xs font-medium text-muted transition-colors duration-150 hover:text-foreground"
              >
                Reset
              </button>
            )}
            <div className="flex overflow-hidden rounded-md border border-border">
              <button
                type="button"
                onClick={() => switchView("grid")}
                className={`inline-flex h-8 w-8 items-center justify-center transition-all duration-150 ${
                  view === "grid"
                    ? "bg-accent/10 text-foreground"
                    : "bg-transparent text-muted hover:bg-subtle hover:text-foreground"
                }`}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
              >
                <LayoutGrid className="size-3.5" aria-hidden />
              </button>
              <span className="w-px bg-border" aria-hidden />
              <button
                type="button"
                onClick={() => switchView("list")}
                className={`inline-flex h-8 w-8 items-center justify-center transition-all duration-150 ${
                  view === "list"
                    ? "bg-accent/10 text-foreground"
                    : "bg-transparent text-muted hover:bg-subtle hover:text-foreground"
                }`}
                aria-label="List view"
                aria-pressed={view === "list"}
              >
                <List className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

