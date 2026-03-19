export default function SettingsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-32 rounded bg-subtle" />
      <div className="h-5 w-56 rounded bg-subtle" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-28 rounded bg-subtle" />
          <div className="h-24 rounded-lg border border-border bg-card/50" />
        </div>
      ))}
    </div>
  );
}
