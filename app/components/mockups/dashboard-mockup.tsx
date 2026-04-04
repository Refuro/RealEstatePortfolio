const METRICS_ROW_1 = [
  { label: "Total property value", value: "$819,700" },
  { label: "Total debt", value: "$462,800" },
  { label: "Total equity", value: "$356,900" },
  { label: "Monthly cash flow", value: "$1,930", tone: "positive" as const },
  { label: "Portfolio cap rate", value: "6.75%" },
];

const METRICS_ROW_2 = [
  { label: "Portfolio LTV", value: "56.5%" },
  { label: "NOI", value: "$55,290" },
  { label: "Cash-on-cash return", value: "20.22%" },
  { label: "Annual rent", value: "$66,000" },
  { label: "DSCR", value: "1.72", tone: "positive" as const },
];

const RENT_ROWS = [
  { name: "Oak Street Duplex", label: "Rent 4.0% below market", tone: "negative" as const },
  { name: "Pine Cottage", label: "Rent 2.6% above market", tone: "positive" as const },
  { name: "Westport Property", label: "Rent 5.7% above market", tone: "positive" as const },
];

const TONE_CLASS = {
  positive: "text-positive",
  negative: "text-negative",
  warning: "text-warning",
} as const;

function MockMetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "warning";
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd
        className={`mt-1 truncate text-base font-semibold ${
          tone ? TONE_CLASS[tone] : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

const WORKSPACE_TABS = ["Properties", "Modeling", "Mortgage", "Print summary"];

export function DashboardMockup() {
  return (
    <div className="space-y-4 p-5">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
          Add property
        </span>
        <span className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground">
          Analyze a deal
        </span>
      </div>

      {/* Workspace tabs */}
      <div className="flex flex-wrap gap-2">
        {WORKSPACE_TABS.map((tab) => (
          <span
            key={tab}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground"
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Metric row 1 */}
      <div className="rounded-xl bg-subtle/30 p-2">
        <dl className="grid grid-cols-5 gap-2">
          {METRICS_ROW_1.map((m) => (
            <MockMetricCard key={m.label} {...m} />
          ))}
        </dl>
      </div>

      {/* Metric row 2 */}
      <div className="rounded-xl bg-subtle/30 p-2">
        <dl className="grid grid-cols-5 gap-2">
          {METRICS_ROW_2.map((m) => (
            <MockMetricCard key={m.label} {...m} />
          ))}
        </dl>
      </div>

      {/* "What do these mean?" link */}
      <p className="text-sm text-accent">What do these mean?</p>

      {/* Rent vs. market */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Rent vs. market
            </h3>
            <p className="mt-1 text-sm text-muted">3 fresh benchmarks</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-muted">
              Above:{" "}
              <span className="font-semibold text-foreground">2</span>
            </span>
            <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-muted">
              Below:{" "}
              <span className="font-semibold text-foreground">1</span>
            </span>
            <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-muted">
              Aligned:{" "}
              <span className="font-semibold text-foreground">0</span>
            </span>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {RENT_ROWS.map((r) => (
            <li
              key={r.name}
              className="flex items-center justify-between rounded-lg border border-border bg-subtle/40 px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">
                {r.name}
              </span>
              <span className={`text-sm font-semibold ${TONE_CLASS[r.tone]}`}>
                {r.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
