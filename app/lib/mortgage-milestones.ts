import {
  getEffectiveBalance,
  getToleranceAwarePayoffProjection,
  type MortgageRecord,
} from "@/lib/amortization";

const LTV_THRESHOLDS = [75, 50, 25] as const;
const PAYOFF_WITHIN_YEARS = 5;
const PAYOFF_WITHIN_MONTHS = PAYOFF_WITHIN_YEARS * 12;

type DecimalLike = number | { toString(): string };

export type MilestoneMortgage = MortgageRecord & {
  id: string;
};

export type MilestoneProperty = {
  id: string;
  nickname: string | null;
  currentEstimatedValue: DecimalLike;
  mortgages: MilestoneMortgage[];
};

export type MortgageMilestone = {
  key: string;
  propertyId: string;
  propertyLabel: string;
  type: "ltv" | "payoff";
  title: string;
  details: string;
};

export type MortgageMilestoneSentinel = Record<string, string | null | undefined>;

function toNumber(value: DecimalLike): number {
  if (typeof value === "number") return value;
  return Number(value.toString());
}

function getPropertyLabel(property: Pick<MilestoneProperty, "nickname" | "id">): string {
  const nickname = property.nickname?.trim();
  return nickname && nickname.length > 0 ? nickname : `Property ${property.id.slice(0, 6)}`;
}

function getMonthsUntil(from: Date, to: Date): number {
  const fromMonth = new Date(from.getFullYear(), from.getMonth(), 1);
  const toMonth = new Date(to.getFullYear(), to.getMonth(), 1);
  return (toMonth.getFullYear() - fromMonth.getFullYear()) * 12 + (toMonth.getMonth() - fromMonth.getMonth());
}

export function detectNewMortgageMilestonesForProperty(args: {
  property: MilestoneProperty;
  sentinels: MortgageMilestoneSentinel;
  now?: Date;
}): MortgageMilestone[] {
  const { property, sentinels } = args;
  const now = args.now ?? new Date();
  const milestones: MortgageMilestone[] = [];
  const propertyLabel = getPropertyLabel(property);

  const totalEffectiveBalance = property.mortgages.reduce(
    (sum, mortgage) => sum + getEffectiveBalance(mortgage),
    0
  );
  const estimatedValue = toNumber(property.currentEstimatedValue);

  if (estimatedValue > 0) {
    const ltvPercent = (totalEffectiveBalance / estimatedValue) * 100;
    for (const threshold of LTV_THRESHOLDS) {
      const key = `${property.id}__ltv_${threshold}`;
      if (ltvPercent <= threshold && !sentinels[key]) {
        milestones.push({
          key,
          propertyId: property.id,
          propertyLabel,
          type: "ltv",
          title: `${propertyLabel}: crossed below ${threshold}% LTV`,
          details: `Estimated LTV is now ${ltvPercent.toFixed(1)}%.`,
        });
      }
    }
  }

  for (const mortgage of property.mortgages) {
    const projection = getToleranceAwarePayoffProjection(mortgage);
    if (!projection.payoffDate) continue;

    const monthsUntilPayoff = getMonthsUntil(now, projection.payoffDate);
    if (monthsUntilPayoff < 0 || monthsUntilPayoff > PAYOFF_WITHIN_MONTHS) continue;

    const key = `${property.id}__${mortgage.id}__payoff_5yr`;
    if (sentinels[key]) continue;

    milestones.push({
      key,
      propertyId: property.id,
      propertyLabel,
      type: "payoff",
      title: `${propertyLabel}: mortgage projected paid off within ${PAYOFF_WITHIN_YEARS} years`,
      details: `Projected payoff date: ${projection.payoffDate.toISOString().slice(0, 10)}.`,
    });
  }

  return milestones;
}

export function detectNewMortgageMilestonesForUser(args: {
  properties: MilestoneProperty[];
  sentinels: MortgageMilestoneSentinel;
  now?: Date;
}): MortgageMilestone[] {
  const { properties, sentinels } = args;
  const now = args.now ?? new Date();

  return properties.flatMap((property) =>
    detectNewMortgageMilestonesForProperty({
      property,
      sentinels,
      now,
    })
  );
}
