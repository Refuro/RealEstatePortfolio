type SnapshotTrendInput = {
  propertyId: string;
  snapshotMonth: Date;
  estimatedValue: number;
  equity: number;
  monthlyCashFlow: number;
};

export type DashboardTrends = {
  portfolio: {
    valueDeltaMoM: number | null;
    equityDeltaMoM: number | null;
    cashFlowDeltaMoM: number | null;
    equityDeltaSinceFirst: number | null;
    equitySeries: number[];
    monthLabels: string[];
  };
  propertyEquityDeltaMoM: Record<string, number | null>;
};

type AggregatedMonth = {
  month: Date;
  monthLabel: string;
  totalValue: number;
  totalEquity: number;
  totalCashFlow: number;
};

function toMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function toMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function getDelta(current: number | undefined, previous: number | undefined): number | null {
  if (current == null || previous == null) return null;
  return current - previous;
}

export function buildDashboardTrends(snapshots: SnapshotTrendInput[]): DashboardTrends {
  const byMonth = new Map<string, AggregatedMonth>();
  const byProperty = new Map<string, SnapshotTrendInput[]>();

  for (const row of snapshots) {
    const monthKey = toMonthKey(row.snapshotMonth);
    const currentMonth = byMonth.get(monthKey);
    if (currentMonth) {
      currentMonth.totalValue += row.estimatedValue;
      currentMonth.totalEquity += row.equity;
      currentMonth.totalCashFlow += row.monthlyCashFlow;
    } else {
      byMonth.set(monthKey, {
        month: row.snapshotMonth,
        monthLabel: toMonthLabel(row.snapshotMonth),
        totalValue: row.estimatedValue,
        totalEquity: row.equity,
        totalCashFlow: row.monthlyCashFlow,
      });
    }

    const propertyRows = byProperty.get(row.propertyId) ?? [];
    propertyRows.push(row);
    byProperty.set(row.propertyId, propertyRows);
  }

  const months = Array.from(byMonth.values()).sort(
    (a, b) => a.month.getTime() - b.month.getTime()
  );
  const latest = months.at(-1);
  const previous = months.at(-2);
  const first = months.at(0);

  const propertyEquityDeltaMoM: Record<string, number | null> = {};
  for (const [propertyId, propertyRows] of byProperty.entries()) {
    const ordered = [...propertyRows].sort(
      (a, b) => a.snapshotMonth.getTime() - b.snapshotMonth.getTime()
    );
    const current = ordered.at(-1);
    const prior = ordered.at(-2);
    propertyEquityDeltaMoM[propertyId] = getDelta(
      current?.equity,
      prior?.equity
    );
  }

  return {
    portfolio: {
      valueDeltaMoM: getDelta(latest?.totalValue, previous?.totalValue),
      equityDeltaMoM: getDelta(latest?.totalEquity, previous?.totalEquity),
      cashFlowDeltaMoM: getDelta(latest?.totalCashFlow, previous?.totalCashFlow),
      equityDeltaSinceFirst: getDelta(latest?.totalEquity, first?.totalEquity),
      equitySeries: months.map((m) => m.totalEquity),
      monthLabels: months.map((m) => m.monthLabel),
    },
    propertyEquityDeltaMoM,
  };
}
