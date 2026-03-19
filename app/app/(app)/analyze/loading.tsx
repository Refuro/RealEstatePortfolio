export default function AnalyzeLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-subtle" />
      <div className="h-5 w-80 rounded bg-subtle" />
      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7 space-y-3">
          <div className="h-40 rounded-xl border border-border bg-card/50" />
          <div className="h-32 rounded-xl border border-border bg-card/50" />
          <div className="h-32 rounded-xl border border-border bg-card/50" />
        </div>
        <div className="xl:col-span-5 space-y-3">
          <div className="h-48 rounded-xl border border-border bg-card/50" />
          <div className="h-36 rounded-xl border border-border bg-card/50" />
        </div>
      </div>
    </div>
  );
}
