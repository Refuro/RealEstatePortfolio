export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-subtle" />
      <div className="h-24 rounded-xl border border-border bg-card/50 p-4" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-lg border border-border bg-card/50" />
        ))}
      </div>
    </div>
  );
}
