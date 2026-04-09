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

  return (
    <div className="grid gap-3 md:hidden">
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">
          Filter
        </span>
        <select
          value={activeFilter}
          onChange={(e) => pushState(e.target.value, activeSort, activeView)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base md:text-sm font-medium text-foreground"
        >
          {filterOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">
          Sort
        </span>
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
