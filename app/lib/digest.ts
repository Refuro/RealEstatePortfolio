export type DigestSnapshot = {
  propertyId: string;
  propertyLabel: string;
  estimatedValue: number;
  effectiveMortgageBalance: number;
  equity: number;
  marketRent: number | null;
  monthlyRent: number;
  monthlyCashFlow: number;
  capRate: number | null;
  ltv: number | null;
  avmValueApplied: boolean;
  avmRentApplied: boolean;
};

export type DigestPropertyItem = {
  propertyId: string;
  propertyLabel: string;
  equity: number;
  equityDelta: number | null;
  monthlyCashFlow: number;
  monthlyCashFlowDelta: number | null;
  marketRent: number | null;
  rentGapPercent: number | null;
  valueUpdated: boolean;
  rentUpdated: boolean;
};

export type DigestContent = {
  monthLabel: string;
  totalPaydown: number;
  totalEquity: number;
  totalEquityDelta: number | null;
  anyValueUpdated: boolean;
  anyRentUpdated: boolean;
  items: DigestPropertyItem[];
};

function monthLabel(date: Date): string {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

function toMapByProperty(snapshots: DigestSnapshot[]): Map<string, DigestSnapshot> {
  return new Map(snapshots.map((snapshot) => [snapshot.propertyId, snapshot]));
}

export function buildDigestContent(args: {
  currentSnapshots: DigestSnapshot[];
  previousSnapshots: DigestSnapshot[];
  now?: Date;
}): DigestContent {
  const now = args.now ?? new Date();
  const previousByProperty = toMapByProperty(args.previousSnapshots);

  const items: DigestPropertyItem[] = args.currentSnapshots.map((current) => {
    const previous = previousByProperty.get(current.propertyId) ?? null;
    const equityDelta = previous ? current.equity - previous.equity : null;
    const monthlyCashFlowDelta = previous
      ? current.monthlyCashFlow - previous.monthlyCashFlow
      : null;
    const rentGapPercent =
      current.marketRent && current.marketRent > 0
        ? roundPercent(((current.monthlyRent - current.marketRent) / current.marketRent) * 100)
        : null;

    return {
      propertyId: current.propertyId,
      propertyLabel: current.propertyLabel,
      equity: roundCurrency(current.equity),
      equityDelta: equityDelta == null ? null : roundCurrency(equityDelta),
      monthlyCashFlow: roundCurrency(current.monthlyCashFlow),
      monthlyCashFlowDelta:
        monthlyCashFlowDelta == null ? null : roundCurrency(monthlyCashFlowDelta),
      marketRent: current.marketRent == null ? null : roundCurrency(current.marketRent),
      rentGapPercent,
      valueUpdated: current.avmValueApplied,
      rentUpdated: current.avmRentApplied,
    };
  });

  const totalPaydown = roundCurrency(
    args.currentSnapshots.reduce((sum, current) => {
      const previous = previousByProperty.get(current.propertyId);
      if (!previous) return sum;
      const paydown = previous.effectiveMortgageBalance - current.effectiveMortgageBalance;
      return sum + Math.max(paydown, 0);
    }, 0)
  );

  const totalEquity = roundCurrency(
    args.currentSnapshots.reduce((sum, snapshot) => sum + snapshot.equity, 0)
  );
  const previousEquityTotal = args.previousSnapshots.reduce(
    (sum, snapshot) => sum + snapshot.equity,
    0
  );
  const totalEquityDelta =
    args.previousSnapshots.length > 0
      ? roundCurrency(totalEquity - previousEquityTotal)
      : null;

  return {
    monthLabel: monthLabel(now),
    totalPaydown,
    totalEquity,
    totalEquityDelta,
    anyValueUpdated: args.currentSnapshots.some((snapshot) => snapshot.avmValueApplied),
    anyRentUpdated: args.currentSnapshots.some((snapshot) => snapshot.avmRentApplied),
    items,
  };
}

export function isDigestWorthSending(
  content: DigestContent,
  mortgageMilestonesCrossedThisMonth: number
): boolean {
  if (content.items.length === 0) return false;
  if (mortgageMilestonesCrossedThisMonth > 0) return true;
  if (content.totalPaydown >= 50) return true;
  if (content.anyValueUpdated) return true;
  if (content.anyRentUpdated) return true;
  return false;
}
