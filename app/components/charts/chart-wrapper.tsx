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
};

export function ChartWrapper({
  title,
  isEmpty,
  emptyMessage = "No data to display",
  children,
}: ChartWrapperProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {isEmpty ? (
        <div className="mt-4 flex h-[240px] items-center justify-center rounded border border-dashed border-border bg-subtle/50 text-sm text-muted">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 h-[240px] w-full">{children}</div>
      )}
    </div>
  );
}
