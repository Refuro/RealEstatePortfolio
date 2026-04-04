const SUMMARY_CARDS = [
  { label: "Baseline payoff", value: "July 2053" },
  { label: "With extra payment", value: "July 2043" },
  { label: "Time saved", value: "10 years", tone: "positive" as const },
  { label: "Interest saved (est.)", value: "$129,773" },
];

const PAYOFF_PRESETS = [
  { label: "5y $166/mo", selected: false },
  { label: "10y $443/mo", selected: true },
  { label: "15y $975/mo", selected: false },
];

/**
 * Hand-drawn SVG of two declining balance curves.
 * Baseline (teal/chart-3) declines slowly to zero at ~month 360.
 * Scenario (blue/chart-1) declines faster, hitting zero around month 240.
 */
function BalanceProjectionChart() {
  const w = 440;
  const h = 220;
  const px = 45;
  const py = 20;
  const pb = 30;
  const chartW = w - px - 10;
  const chartH = h - py - pb;

  const yTicks = [0, 75_000, 150_000, 225_000, 300_000];
  const xLabels = [
    "Apr 26", "Feb 28", "Jan 30", "Dec 31", "Oct 33",
    "Jul 35", "Jan 39", "Jan 41", "Dec 44", "Feb 48", "May 53",
  ];

  const bx = px;
  const by = py + 2;
  const bottom = py + chartH;

  const toFunctionalPath = (
    startX: number,
    endX: number,
    yAtT: (t: number) => number,
    steps = 36
  ) => {
    const points = Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      return {
        x: startX + (endX - startX) * t,
        y: yAtT(t),
      };
    });
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L${points[i].x},${points[i].y}`;
    }
    return d;
  };

  // Baseline: smooth concave arc from $300k → $0 over full term
  const baselinePath =
    `M${bx},${by} ` +
    `C${bx + chartW * 0.55},${by + chartH * 0.04} ` +
    `${bx + chartW * 0.82},${by + chartH * 0.42} ` +
    `${bx + chartW},${bottom}`;

  // Scenario: continuous amortization-like curve (no knot turns).
  const scenarioEndX = bx + chartW * 0.64;
  const scenarioPath = toFunctionalPath(
    bx,
    scenarioEndX,
    (t) => {
      // Blend powers to match the real screenshot's early-flat/later-steep arc.
      const shaped = 0.78 * Math.pow(t, 1.55) + 0.22 * Math.pow(t, 2.85);
      return by + chartH * shaped;
    },
    44
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        aria-hidden="true"
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = py + (chartH * (1 - tick / 300_000));
          return (
            <g key={tick}>
              <line
                x1={px}
                y1={y}
                x2={px + chartW}
                y2={y}
                className="stroke-border"
                strokeWidth={0.5}
              />
              <text
                x={px - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-muted text-[7px]"
              >
                {i === 0 ? "$0k" : `$${tick / 1000}k`}
              </text>
            </g>
          );
        })}

        {/* X-axis labels (subset) */}
        {xLabels.map((label, i) => {
          const x = px + (chartW * i) / (xLabels.length - 1);
          return (
            <text
              key={label}
              x={x}
              y={h - 6}
              textAnchor="middle"
              className="fill-muted text-[5.5px]"
            >
              {label}
            </text>
          );
        })}

        {/* Baseline curve */}
        <path
          d={baselinePath}
          fill="none"
          stroke="var(--chart-3)"
          strokeWidth={2}
        />

        {/* Scenario curve */}
        <path
          d={scenarioPath}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2}
        />
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: "var(--chart-3)" }}
          />
          Baseline
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: "var(--chart-1)" }}
          />
          With extra
        </span>
      </div>
    </div>
  );
}

export function MortgageMockup() {
  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Mortgage</h2>
          <p className="mt-1 text-sm text-muted">
            Run mortgage payoff simulations in a global workspace.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted">
              1 mortgage
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Property</p>
          <span className="mt-1 inline-block rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground">
            Westport Property ▾
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {SUMMARY_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-md border border-border bg-card p-3"
          >
            <p className="text-xs text-muted">{card.label}</p>
            <p
              className={`mt-1 text-lg font-semibold ${
                card.tone === "positive" ? "text-positive" : "text-foreground"
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main two-panel layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Simulation controls */}
        <div className="col-span-5 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Simulation controls
            </h3>
            <div className="flex gap-3 text-xs text-muted">
              <span>Mortgage details</span>
              <span>Reset</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted">
            Apply extra principal monthly to compare payoff speed and interest
            savings.
          </p>

          {/* Mortgage summary */}
          <div className="mt-4 rounded-md border border-border bg-background/45 p-3">
            <p className="text-xs text-muted">Mortgage and payment</p>
            <div className="mt-2 rounded-md border border-border bg-background p-2.5">
              <p className="text-xs text-muted">Selected mortgage</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                $288,084 at 6.25%
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted">Extra principal ($/month)</p>
                <div className="mt-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground">
                  443
                </div>
              </div>
              <div>
                <p className="text-xs text-muted">Base P&I</p>
                <p className="mt-1 px-2.5 py-1.5 text-sm font-semibold text-foreground">
                  $1,835/mo
                </p>
              </div>
            </div>
          </div>

          {/* Payoff presets */}
          <div className="mt-4">
            <p className="text-xs font-medium text-foreground">Pay off earlier</p>
            <p className="mt-1 text-[10px] text-muted">
              Targets use end-of-term tolerance (readable payoff date); exports
              stay strict.
            </p>
            <div className="mt-2 flex gap-2">
              {PAYOFF_PRESETS.map((p) => (
                <span
                  key={p.label}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                    p.selected
                      ? "border-accent bg-accent/12 text-foreground ring-1 ring-accent/25"
                      : "border-border text-muted"
                  }`}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Rate/term chips */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
            <span>
              Rate: <span className="font-medium text-foreground">6.25%</span>
            </span>
            <span>
              Term: <span className="font-medium text-foreground">30 years</span>
            </span>
            <span>
              Base P&I:{" "}
              <span className="font-medium text-foreground">$1,835/mo</span>
            </span>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="col-span-7 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">
            Balance projection (baseline vs extra principal)
          </h3>
          <p className="mt-1 text-xs text-muted">
            Baseline follows current payment terms. &ldquo;With extra
            payment&rdquo; adds your extra principal each month to accelerate
            payoff.
          </p>
          <div className="mt-3">
            <BalanceProjectionChart />
          </div>
        </div>
      </div>

      {/* Baseline note */}
      <p className="rounded-md border border-border bg-subtle/30 p-3 text-[10px] text-muted">
        Baseline assumes no extra principal payments. Monthly payment $1,835/mo.
        &ldquo;With extra payment&rdquo; adds $443/mo in extra principal.
      </p>
      <p className="text-[10px] text-muted">
        Estimates for informational purposes only. Not financial advice.
      </p>
    </div>
  );
}
