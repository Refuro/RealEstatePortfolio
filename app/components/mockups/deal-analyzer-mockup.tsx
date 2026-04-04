const SIGNAL_CARDS = [
  {
    label: "Monthly cash flow",
    value: "$940",
    subtitle: "Healthy cash flow",
    tone: "positive" as const,
  },
  {
    label: "DSCR",
    value: "1.35",
    subtitle: "DSCR above 1.2",
    tone: "positive" as const,
  },
  {
    label: "Cap rate",
    value: "9.57%",
    subtitle: "Higher yield profile",
    tone: undefined,
  },
];

const SIGNAL_CHIPS = [
  "Ownership: 100%",
  "Vacancy: 5%",
  "Debt: $2,650/mo",
];

const INVESTMENT_METRICS = [
  { label: "Monthly cash flow", value: "$940", tone: "positive" as const },
  { label: "Annual cash flow", value: "$11,280", tone: "positive" as const },
  { label: "Equity", value: "$150,000" },
  { label: "Cap rate", value: "9.57%" },
  { label: "Loan-to-value", value: "66.7%" },
  { label: "NOI", value: "$43,080" },
  { label: "Cash-on-cash", value: "7.52%" },
  { label: "DSCR", value: "1.35", tone: "positive" as const },
  { label: "Annual rent", value: "$47,880" },
];

const TONE_CLASS = {
  positive: "text-positive",
  negative: "text-negative",
} as const;

function MockInput({ label, value, colSpan }: { label: string; value: string; colSpan?: string }) {
  return (
    <div className={colSpan}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

export function DealAnalyzerMockup() {
  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Analyze deal
        </h2>
        <p className="mt-1 text-sm text-muted">
          Enter deal assumptions, review investment outcomes, and save for
          comparison.
        </p>
        <p className="mt-1 text-sm text-accent">
          View saved deals{" "}
          <span className="text-muted">
            to compare or edit analyses you&apos;ve already stored.
          </span>
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Deal assumptions */}
        <div className="col-span-7 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-muted">
            Deal assumptions
          </h3>
          <p className="mt-1 text-xs text-muted">
            Update assumptions below to see live investment outcomes.
          </p>

          {/* Basics */}
          <div className="mt-4 rounded-md border border-border bg-background/45 p-3.5">
            <p className="text-xs font-semibold text-muted">
              Basics
            </p>
            <div className="mt-3 space-y-3">
              <MockInput label="Address line 1" value="456 Oak Street" />
              <MockInput label="Address line 2 (optional)" value="Apt 4" />
              <div className="grid grid-cols-3 gap-3">
                <MockInput label="City" value="Austin" />
                <div>
                  <p className="text-xs font-medium text-muted">State</p>
                  <div className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                    TX ▾
                  </div>
                </div>
                <MockInput label="ZIP" value="78071" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MockInput label="Purchase price" value="450,000" />
                <div>
                  <MockInput label="Current value" value="450,000" />
                  <p className="mt-0.5 text-[10px] text-muted">
                    Defaults to purchase price
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Income and expenses */}
          <div className="mt-3 rounded-md border border-border bg-background/45 p-3.5">
            <p className="text-xs font-semibold text-muted">
              Income and expenses
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <MockInput label="Monthly rent" value="4,200" />
              <MockInput label="Monthly expenses" value="400" />
              <MockInput label="Vacancy %" value="5" />
            </div>
          </div>

          {/* Debt and ownership */}
          <div className="mt-3 rounded-md border border-border bg-background/45 p-3.5">
            <p className="text-xs font-semibold text-muted">
              Debt and ownership
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <MockInput label="Mortgage balance (optional)" value="300,000" />
              <MockInput label="Monthly payment (optional)" value="2,650" />
              <MockInput label="Cash invested (optional)" value="150,000" />
            </div>
            <div className="mt-3 max-w-[200px]">
              <MockInput label="Ownership %" value="100" />
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="col-span-5 space-y-3.5">
          {/* Deal actions */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted">
                Deal actions
              </h3>
              <span className="text-xs text-muted">0 of 20 saved</span>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
                Save deal
              </span>
              <span className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground">
                New deal
              </span>
              <span className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground">
                Open saved deals
              </span>
            </div>
          </div>

          {/* Stress test */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-muted">
              Stress test
            </h3>
            <p className="mt-1 text-[10px] text-muted">
              Apply quick sensitivity presets without changing saved baseline
              inputs.
            </p>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs text-muted">Rent sensitivity</p>
                <div className="mt-1 flex gap-2">
                  {["-10%", "0%", "+10%"].map((v) => (
                    <span
                      key={`rent-${v}`}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                        v === "0%"
                          ? "border-accent/50 bg-subtle text-foreground"
                          : "border-border text-muted"
                      }`}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted">Expense sensitivity</p>
                <div className="mt-1 flex gap-2">
                  {["-10%", "0%", "+10%"].map((v) => (
                    <span
                      key={`exp-${v}`}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                        v === "0%"
                          ? "border-accent/50 bg-subtle text-foreground"
                          : "border-border text-muted"
                      }`}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Deal signal */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-muted">
              Deal signal
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SIGNAL_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="rounded-md border border-border bg-background/50 px-2.5 py-1.5"
                >
                  <p className="text-[10px] text-muted">{card.label}</p>
                  <p
                    className={`text-base font-semibold ${
                      card.tone ? TONE_CLASS[card.tone] : "text-foreground"
                    }`}
                  >
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-[10px] text-muted">{card.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIGNAL_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Investment metrics */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-muted">
              Investment metrics
            </h3>
            <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3">
              {INVESTMENT_METRICS.map((m) => (
                <div key={m.label}>
                  <dt className="text-[10px] text-muted">{m.label}</dt>
                  <dd
                    className={`text-sm font-semibold ${
                      m.tone ? TONE_CLASS[m.tone] : "text-foreground"
                    }`}
                  >
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
