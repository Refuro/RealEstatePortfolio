export default function RefinanceLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Page heading */}
      <div className="h-8 w-36 rounded-md bg-subtle" />
      {/* Action strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="h-4 w-72 rounded-md bg-subtle" />
        <div className="h-9 w-72 rounded-md bg-subtle" />
      </div>
      {/* Two-column inputs + results panel */}
      <div className="mt-4 grid grid-cols-[1fr_2fr] rounded-xl border border-border bg-card/50 shadow-sm divide-x divide-border">
        <div className="space-y-4 p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 rounded-md bg-subtle" />
              <div className="h-9 rounded-md bg-subtle/60" />
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="h-3 w-12 rounded-md bg-subtle" />
          <div className="mt-4 flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-28 rounded-lg bg-subtle/60" />
            ))}
          </div>
        </div>
      </div>
      {/* Chart panel */}
      <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
        <div className="h-3 w-28 rounded-md bg-subtle" />
        <div className="mt-3 h-[280px] rounded-lg bg-subtle/60" />
      </div>
    </div>
  );
}
