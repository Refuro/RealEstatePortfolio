export default function PropertiesLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-32 rounded bg-subtle" />
        <div className="h-9 w-24 rounded bg-subtle" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 rounded-lg border border-border bg-card/50" />
        ))}
      </div>
    </div>
  );
}
