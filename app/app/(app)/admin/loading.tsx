export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-32 rounded bg-subtle" />
      <div className="h-5 w-56 rounded bg-subtle" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-lg border border-border bg-card/50" />
        ))}
      </div>
      <div className="h-64 rounded-lg border border-border bg-card/50" />
    </div>
  );
}
