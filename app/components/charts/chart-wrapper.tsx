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
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      {isEmpty ? (
        <div className="mt-4 flex h-[240px] items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-50/50 text-sm text-zinc-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 h-[240px] w-full">{children}</div>
      )}
    </div>
  );
}
