export default function MortgageLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Page heading */}
      <div className="h-8 w-32 rounded-md bg-subtle" />
      {/* Action strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="h-4 w-72 rounded-md bg-subtle" />
        <div className="h-9 w-72 rounded-md bg-subtle" />
      </div>
      {/* Mortgage panel */}
      <div className="mt-4 rounded-xl border border-border bg-card/50 shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-7 w-24 rounded-md bg-subtle" />
            ))}
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-subtle/60" />
            ))}
          </div>
          <div className="h-[260px] rounded-lg bg-subtle/60" />
        </div>
      </div>
    </div>
  );
}
