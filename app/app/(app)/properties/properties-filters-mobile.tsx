"use client";

import { useRouter } from "next/navigation";

type Option = {
  key: string;
  label: string;
};

type PropertiesFiltersMobileProps = {
  activeFilter: string;
  activeSort: string;
  activeView: "grid" | "list";
  filterOptions: Option[];
  sortOptions: Option[];
};

export function PropertiesFiltersMobile({
  activeFilter,
  activeSort,
  activeView,
  filterOptions,
  sortOptions,
}: PropertiesFiltersMobileProps) {
  const router = useRouter();

  function pushState(filter: string, sort: string, view: "grid" | "list") {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (sort !== "updated") params.set("sort", sort);
    params.set("view", view);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  }

  const chipBase =
    "shrink-0 rounded-full border px-3 py-1 text-sm transition-all duration-150";
  const chipActive =
    "border-accent bg-accent/10 font-semibold text-foreground";
  const chipInactive =
    "border-border bg-transparent font-medium text-muted hover:bg-subtle hover:text-foreground";

  return (
    <div className="grid gap-3 md:hidden">
      <div
        className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {filterOptions.map((option) => {
          const active = activeFilter === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => pushState(option.key, activeSort, activeView)}
              className={`${chipBase} ${active ? chipActive : chipInactive}`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">Sort</span>
        <select
          value={activeSort}
          onChange={(e) => pushState(activeFilter, e.target.value, activeView)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base md:text-sm font-medium text-foreground"
        >
          {sortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
