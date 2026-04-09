"use client";

import { useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

type PropertiesFilter =
  | "all"
  | "needs_attention"
  | "no_mortgage"
  | "stale_benchmark"
  | "negative_cashflow"
  | "incomplete_profile";
type PropertiesSort = "updated" | "worst_cashflow";
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

  // Optimistic state — updates on the same frame as click, before server responds
  const [filter, setFilter] = useState<PropertiesFilter>(serverFilter);
  const [sort, setSort] = useState<PropertiesSort>(serverSort);

  // Sync back when server navigation settles (e.g. back/forward button)
  useEffect(() => { setFilter(serverFilter); }, [serverFilter]);
  useEffect(() => { setSort(serverSort); }, [serverSort]);

  function navigate(
    newFilter: PropertiesFilter,
    newSort: PropertiesSort
  ) {
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
      {/* Mobile */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center gap-2">
          {/* Mobile filter select */}
          <select
            value={filter}
            onChange={(e) => navigate(e.target.value as PropertiesFilter, sort)}
            className="min-h-[44px] flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-base font-medium text-foreground"
          >
            {filterOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile sort select */}
          <select
            value={sort}
            onChange={(e) => navigate(filter, e.target.value as PropertiesSort)}
            className="min-h-[44px] flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-base font-medium text-foreground"
          >
            {sortOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
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
        {/* Row 1: filter chips */}
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

        {/* Row 2: sort chips + reset */}
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
          {(filter !== "all" || sort !== "updated") && (
            <button
              type="button"
              onClick={() => navigate("all", "updated")}
              className="ml-auto shrink-0 text-xs font-medium text-muted transition-colors duration-150 hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type ViewToggleProps = {
  activeView: PropertiesView;
  activeFilter: PropertiesFilter;
  activeSort: PropertiesSort;
};

export function PropertiesViewToggle({
  activeView,
  activeFilter,
  activeSort,
}: ViewToggleProps) {
  return (
    <div className="hidden shrink-0 overflow-hidden rounded-md border border-border md:flex">
      <ViewBtn
        view="grid"
        activeView={activeView}
        activeFilter={activeFilter}
        activeSort={activeSort}
      />
      <span className="w-px bg-border" aria-hidden />
      <ViewBtn
        view="list"
        activeView={activeView}
        activeFilter={activeFilter}
        activeSort={activeSort}
      />
    </div>
  );
}

function ViewBtn({
  view,
  activeView,
  activeFilter,
  activeSort,
}: {
  view: PropertiesView;
  activeView: PropertiesView;
  activeFilter: PropertiesFilter;
  activeSort: PropertiesSort;
}) {
  const isActive = activeView === view;
  return (
    <a
      href={buildPropertiesHref(activeFilter, activeSort, view)}
      className={`inline-flex h-8 w-8 items-center justify-center transition-all duration-150 ${
        isActive
          ? "bg-accent/10 text-foreground"
          : "bg-transparent text-muted hover:bg-subtle hover:text-foreground"
      }`}
      aria-label={view === "grid" ? "Grid view" : "List view"}
      aria-current={isActive ? "page" : undefined}
    >
      {view === "grid" ? (
        <LayoutGrid className="size-3.5" aria-hidden />
      ) : (
        <List className="size-3.5" aria-hidden />
      )}
    </a>
  );
}
