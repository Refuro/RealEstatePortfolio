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
    <div className="min-w-0 rounded-lg border border-border bg-card px-3 py-3.5 shadow-sm">
      <dt className="text-sm font-medium leading-snug text-muted">{label}</dt>
      <dd
        className={`mt-1.5 truncate text-lg font-semibold tabular-nums tracking-tight ${
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
    <div className="space-y-5 p-6">
      {/* Title */}
      <h2 className="text-3xl font-semibold tracking-tight text-foreground">
        Dashboard
      </h2>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-md bg-accent px-3.5 py-2 text-base font-medium text-accent-foreground">
          Add property
        </span>
        <span className="rounded-md border border-border px-3.5 py-2 text-base font-medium text-foreground">
          Analyze a deal
        </span>
      </div>

      {/* Workspace tabs */}
      <div className="flex flex-wrap gap-2.5">
        {WORKSPACE_TABS.map((tab) => (
          <span
            key={tab}
            className="rounded-md border border-border bg-transparent px-3.5 py-2 text-base font-medium text-foreground"
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Metric row 1 */}
      <div className="rounded-xl bg-subtle/30 p-3">
        <dl className="grid grid-cols-5 gap-2.5">
          {METRICS_ROW_1.map((m) => (
            <MockMetricCard key={m.label} {...m} />
          ))}
        </dl>
      </div>

      {/* Metric row 2 */}
      <div className="rounded-xl bg-subtle/30 p-3">
        <dl className="grid grid-cols-5 gap-2.5">
          {METRICS_ROW_2.map((m) => (
            <MockMetricCard key={m.label} {...m} />
          ))}
        </dl>
      </div>

      {/* "What do these mean?" link */}
      <p className="text-base text-accent">What do these mean?</p>

      {/* Rent vs. market */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Rent vs. market
            </h3>
            <p className="mt-1.5 text-sm text-muted">3 fresh benchmarks</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-muted">
              Above:{" "}
              <span className="font-semibold text-foreground">2</span>
            </span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-muted">
              Below:{" "}
              <span className="font-semibold text-foreground">1</span>
            </span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-muted">
              Aligned:{" "}
              <span className="font-semibold text-foreground">0</span>
            </span>
          </div>
        </div>
        <ul className="mt-5 space-y-2.5">
          {RENT_ROWS.map((r) => (
            <li
              key={r.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-subtle/40 px-4 py-3"
            >
              <span className="text-base font-medium text-foreground">
                {r.name}
              </span>
              <span
                className={`shrink-0 text-right text-base font-semibold ${TONE_CLASS[r.tone]}`}
              >
                {r.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
