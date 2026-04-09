import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { fetchRentEstimate, fetchValueEstimate } from "@/lib/integrations/rentcast";
import { getEffectiveTier } from "@/lib/plans";
import { getActivityTier } from "@/lib/activity-tier";
import {
  buildSnapshotData,
  shouldApplyAvmRent,
  shouldApplyAvmValue,
} from "@/lib/snapshots";
import { getPropertyTotalRent } from "@/lib/property-utils";

export const DEFAULT_REFRESH_BATCH_SIZE = 10;

type RefreshUser = Awaited<ReturnType<typeof getRefreshEligibleUsers>>[number];
type RefreshProperty = RefreshUser["properties"][number];

function getSnapshotMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getRefreshEligibleUsers(now: Date) {
  const snapshotMonth = getSnapshotMonth(now);
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      properties: { some: {} },
    },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      subscriptionTier: true,
      subscriptionTierOverride: true,
      trialEndsAt: true,
      createdAt: true,
      lastActiveAt: true,
      properties: {
        select: {
          id: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          zipCode: true,
          propertyType: true,
          units: true,
          nickname: true,
          currentEstimatedValue: true,
          currentMonthlyExpenses: true,
          currentMonthlyRent: true,
          unitRents: true,
          cashInvested: true,
          ownershipPercent: true,
          vacancyPercent: true,
          marketRent: true,
          marketRentAsOf: true,
          mortgages: {
            select: {
              id: true,
              originalLoanAmount: true,
              currentBalance: true,
              interestRate: true,
              termYears: true,
              startDate: true,
              monthlyPayment: true,
              balanceAsOfDate: true,
              paymentEffectiveDate: true,
              escrowIncluded: true,
              escrowAmount: true,
            },
          },
          snapshots: {
            where: { snapshotMonth },
            select: { id: true },
          },
        },
      },
    },
  });

  return users.filter((user) => {
    const effectiveTier = getEffectiveTier(user);
    if (effectiveTier === "free") return false;
    const activityTier = getActivityTier(user.lastActiveAt, user.createdAt, now);
    if (activityTier !== "active" && activityTier !== "cooling") return false;
    return user.properties.some((property) => property.snapshots.length === 0);
  });
}

export async function refreshProperty(
  property: RefreshProperty,
  apiKey: string | null
): Promise<{
  valueEstimate: number | null;
  rentEstimate: number | null;
  valueApplied: boolean;
  rentApplied: boolean;
}> {
  const canCallRentCast =
    !!apiKey &&
    !!property.addressLine1 &&
    !!property.city &&
    !!property.state &&
    !!property.zipCode;
  if (!canCallRentCast) {
    return {
      valueEstimate: null,
      rentEstimate: null,
      valueApplied: false,
      rentApplied: false,
    };
  }

  let valueEstimate: number | null = null;
  let rentEstimate: number | null = null;

  try {
    const valueResult = await fetchValueEstimate(
      {
        address: property.addressLine1,
        addressLine2: property.addressLine2 ?? undefined,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        propertyType: property.propertyType as
          | "single_family"
          | "condo"
          | "townhouse"
          | "manufactured"
          | "multi_family"
          | "apartment",
      },
      apiKey
    );
    valueEstimate = valueResult.value;
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "cron_monthly_refresh", stage: "value_estimate" },
      extra: { propertyId: property.id },
    });
  }

  try {
    const rentResult = await fetchRentEstimate(
      {
        address: property.addressLine1,
        addressLine2: property.addressLine2 ?? undefined,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        propertyType: property.propertyType as
          | "single_family"
          | "condo"
          | "townhouse"
          | "manufactured"
          | "multi_family"
          | "apartment",
        units: property.units,
      },
      apiKey
    );
    rentEstimate = rentResult.rent;
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "cron_monthly_refresh", stage: "rent_estimate" },
      extra: { propertyId: property.id },
    });
  }

  const currentValue = Number(property.currentEstimatedValue);
  const currentRentBaseline =
    property.marketRent != null
      ? Number(property.marketRent)
      : getPropertyTotalRent(property);

  const valueApplied =
    valueEstimate != null
      ? shouldApplyAvmValue(currentValue, valueEstimate)
      : false;
  const rentApplied =
    rentEstimate != null
      ? shouldApplyAvmRent(currentRentBaseline, rentEstimate)
      : false;

  return {
    valueEstimate,
    rentEstimate,
    valueApplied,
    rentApplied,
  };
}

export async function processUserRefresh(
  user: RefreshUser,
  apiKey: string | null,
  now: Date
): Promise<{
  processedProperties: number;
  snapshotsCreated: number;
  propertiesUpdated: number;
  valueAppliedCount: number;
  valueBelowThresholdCount: number;
}> {
  const snapshotMonth = getSnapshotMonth(now);
  let processedProperties = 0;
  let snapshotsCreated = 0;
  let propertiesUpdated = 0;
  let valueAppliedCount = 0;
  let valueBelowThresholdCount = 0;

  for (const property of user.properties) {
    if (property.snapshots.length > 0) continue;
    processedProperties += 1;

    const refreshResult = await refreshProperty(property, apiKey);
    const updateData: {
      currentEstimatedValue?: number;
      estimatedValueAsOf?: Date;
      marketRent?: number;
      marketRentAsOf?: Date;
    } = {};

    if (refreshResult.valueEstimate != null) {
      if (refreshResult.valueApplied) {
        updateData.currentEstimatedValue = refreshResult.valueEstimate;
        updateData.estimatedValueAsOf = snapshotMonth;
        valueAppliedCount += 1;
      } else {
        valueBelowThresholdCount += 1;
      }
    }
    if (refreshResult.rentEstimate != null && refreshResult.rentApplied) {
      updateData.marketRent = refreshResult.rentEstimate;
      updateData.marketRentAsOf = snapshotMonth;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.property.update({
        where: { id: property.id },
        data: updateData,
      });
      propertiesUpdated += 1;
    }

    const snapshot = buildSnapshotData(
      {
        id: property.id,
        currentEstimatedValue:
          updateData.currentEstimatedValue ?? Number(property.currentEstimatedValue),
        currentMonthlyExpenses: property.currentMonthlyExpenses,
        currentMonthlyRent: property.currentMonthlyRent,
        unitRents: property.unitRents,
        cashInvested: property.cashInvested,
        ownershipPercent: property.ownershipPercent,
        vacancyPercent: property.vacancyPercent,
        marketRent: updateData.marketRent ?? property.marketRent,
      },
      property.mortgages,
      {
        valueEstimate: refreshResult.valueEstimate,
        rentEstimate: refreshResult.rentEstimate,
        avmValueApplied: refreshResult.valueApplied,
        avmRentApplied: refreshResult.rentApplied,
      },
      now
    );

    try {
      await prisma.propertySnapshot.create({
        data: snapshot,
      });
      snapshotsCreated += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("Unique constraint failed") && !msg.includes("P2002")) {
        throw err;
      }
    }
  }

  return {
    processedProperties,
    snapshotsCreated,
    propertiesUpdated,
    valueAppliedCount,
    valueBelowThresholdCount,
  };
}
