export default function PlansLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Page heading */}
      <div className="h-8 w-44 rounded-md bg-subtle" />
      <div className="h-4 w-80 rounded-md bg-subtle" />
      {/* Plan context panel */}
      <div className="mt-4 rounded-xl border border-border bg-card/50 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-28 rounded-full bg-subtle" />
          ))}
        </div>
      </div>
      {/* Pricing cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-xl border border-border bg-card/50 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
