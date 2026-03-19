export default function DealsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-40 rounded bg-subtle" />
      <div className="h-5 w-64 rounded bg-subtle" />
      <div className="h-5 w-48 rounded bg-subtle" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl border border-border bg-card/50" />
        ))}
      </div>
    </div>
  );
}
