"use client";

/**
 * Reusable chart wrapper with title and empty/zero state.
 * Module I — ensure charts handle empty/zero states.
 */

type ChartWrapperProps = {
  title: string;
  isEmpty: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  /** When true, no card chrome — parent supplies the panel (e.g. dashboard portfolio charts). */
  embedded?: boolean;
  /** Optional explicit chart content height in pixels for large datasets. */
  heightPx?: number;
};

export function ChartWrapper({
  title,
  isEmpty,
  emptyMessage = "No data to display",
  children,
  embedded = false,
  heightPx,
}: ChartWrapperProps) {
  return (
    <div
      className={
        embedded ? "" : "rounded-lg border border-border bg-card p-5"
      }
    >
      <h3
        className={
          embedded
            ? "text-sm font-semibold text-foreground"
            : "text-sm font-semibold uppercase tracking-wide text-muted"
        }
      >
        {title}
      </h3>
      {isEmpty ? (
        <div className="mt-4 flex h-[200px] items-center justify-center rounded border border-dashed border-border bg-subtle/50 text-sm text-muted sm:h-[240px]">
          {emptyMessage}
        </div>
      ) : (
        <div
          className="mt-4 h-[200px] w-full sm:h-[240px]"
          style={heightPx ? { height: `${heightPx}px` } : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}
