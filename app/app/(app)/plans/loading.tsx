export default function PlansLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-subtle" />
      <div className="h-5 w-72 rounded bg-subtle" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-xl border border-border bg-card/50" />
        ))}
      </div>
    </div>
  );
}
