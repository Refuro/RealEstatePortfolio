import { prisma } from "../lib/db";
import { buildSnapshotData } from "../lib/snapshots";
import { getEffectiveBalance } from "../lib/amortization";

/**
 * Seed data: 3 test accounts with distinct use cases.
 *
 * To sign in as these users, create matching test users in Clerk Dashboard
 * (dev@example.com, investor@example.com, pro@example.com) and update
 * the clerkUserId values below with the real Clerk IDs. Or use Prisma Studio
 * (npm run db:studio) to browse the data.
 */

const SEED_CLERK_IDS = ["user_3C6InYM1m3T3Iw2gwn3TlUgtAqv", "user_3C6IjWn0sEsFUo0vwkmjwCM3D92", "user_3C6IrE2VutbSXJji5bHnKi5pNfK"] as const;

async function main() {
  // Clear existing seed data so re-running is idempotent
  await prisma.user.deleteMany({
    where: { clerkUserId: { in: [...SEED_CLERK_IDS] } },
  });

  // ─── Account 1: Solo Starter (Free tier) ─────────────────────────────────
  // Use case: New landlord, one single-family rental, testing the waters.
  const solo = await prisma.user.create({
    data: {
      clerkUserId: "user_3C6InYM1m3T3Iw2gwn3TlUgtAqv",
      email: "dev@example.com",
      firstName: "Sam",
      lastName: "Starter",
      subscriptionTier: "free",
    },
  });

  await prisma.property.create({
    data: {
      userId: solo.id,
      nickname: "First Rental",
      addressLine1: "123 Oak Lane",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 245_000,
      purchaseDate: new Date("2023-03-15"),
      currentEstimatedValue: 265_000,
      currentMonthlyRent: 2_100,
      unitRents: [2100],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 420,
      cashInvested: 55_000,
      notes: "First rental property. Paid cash, no mortgage.",
    },
  });

  // ─── Account 2: Growth Investor (Investor tier) ──────────────────────────
  // Use case: Active investor with 3 properties, mix of types, some mortgages,
  // one partial-ownership deal.
  const investor = await prisma.user.create({
    data: {
      clerkUserId: "user_3C6IjWn0sEsFUo0vwkmjwCM3D92",
      email: "investor@example.com",
      firstName: "Jordan",
      lastName: "Investor",
      subscriptionTier: "investor",
    },
  });

  const invProp1 = await prisma.property.create({
    data: {
      userId: investor.id,
      nickname: "Maple Street SFH",
      addressLine1: "456 Maple St",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 320_000,
      purchaseDate: new Date("2021-08-01"),
      currentEstimatedValue: 355_000,
      currentMonthlyRent: 2_650,
      unitRents: [2650],
      bedrooms: 4,
      bathrooms: 2.5,
      currentMonthlyExpenses: 580,
      cashInvested: 64_000,
    },
  });

  await prisma.mortgage.create({
    data: {
      propertyId: invProp1.id,
      originalLoanAmount: 256_000,
      currentBalance: 238_000,
      interestRate: 0.0625,
      termYears: 30,
      startDate: new Date("2021-08-01"),
      monthlyPayment: 1_578,
      paymentEffectiveDate: new Date("2024-01-15"),
      escrowIncluded: true,
      lenderName: "Chase",
      loanType: "conventional",
    },
  });

  const invProp2 = await prisma.property.create({
    data: {
      userId: investor.id,
      nickname: "Pine Duplex",
      addressLine1: "789 Pine Ave",
      addressLine2: "Units 1 & 2",
      city: "Houston",
      state: "TX",
      zipCode: "77002",
      propertyType: "multi_family",
      units: 2,
      purchasePrice: 385_000,
      purchaseDate: new Date("2022-11-01"),
      currentEstimatedValue: 420_000,
      currentMonthlyRent: 3_400,
      unitRents: [1650, 1750],
      currentMonthlyExpenses: 720,
      cashInvested: 77_000,
    },
  });

  await prisma.mortgage.create({
    data: {
      propertyId: invProp2.id,
      originalLoanAmount: 308_000,
      currentBalance: 298_000,
      interestRate: 0.0675,
      termYears: 30,
      startDate: new Date("2022-11-01"),
      monthlyPayment: 1_992,
      escrowIncluded: true,
      lenderName: "Wells Fargo",
      loanType: "conventional",
    },
  });

  // Partial ownership (50% partner deal)
  await prisma.property.create({
    data: {
      userId: investor.id,
      nickname: "Downtown Condo (50% share)",
      addressLine1: "100 Commerce St",
      addressLine2: "Unit 4B",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      propertyType: "condo",
      units: 1,
      ownershipPercent: 50,
      purchasePrice: 280_000,
      purchaseDate: new Date("2023-05-01"),
      currentEstimatedValue: 295_000,
      currentMonthlyRent: 2_200,
      unitRents: [2200],
      bedrooms: 2,
      bathrooms: 2,
      currentMonthlyExpenses: 380,
      cashInvested: 35_000,
      notes: "Joint venture with partner. No mortgage.",
    },
  });

  await prisma.subscription.create({
    data: {
      userId: investor.id,
      status: "active",
      planName: "investor",
      currentPeriodEnd: new Date("2025-04-01"),
    },
  });

  // ─── Account 3: Professional Portfolio (Pro tier) ─────────────────────────
  // Use case: Full portfolio manager with diverse property types, multi-family
  // with per-unit rents, mix of mortgages.
  const pro = await prisma.user.create({
    data: {
      clerkUserId: "user_3C6IrE2VutbSXJji5bHnKi5pNfK",
      email: "pro@example.com",
      firstName: "Alex",
      lastName: "Portfolio",
      subscriptionTier: "pro",
    },
  });

  const proProp1 = await prisma.property.create({
    data: {
      userId: pro.id,
      nickname: "Riverside SFH",
      addressLine1: "200 River Rd",
      city: "San Antonio",
      state: "TX",
      zipCode: "78205",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 275_000,
      purchaseDate: new Date("2020-01-15"),
      currentEstimatedValue: 340_000,
      currentMonthlyRent: 2_400,
      unitRents: [2400],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 480,
      cashInvested: 55_000,
    },
  });

  await prisma.mortgage.create({
    data: {
      propertyId: proProp1.id,
      originalLoanAmount: 220_000,
      currentBalance: 198_000,
      interestRate: 0.0375,
      termYears: 30,
      startDate: new Date("2020-01-15"),
      monthlyPayment: 1_018,
      paymentEffectiveDate: new Date("2024-06-01"),
      escrowIncluded: true,
      lenderName: "Rocket Mortgage",
      loanType: "conventional",
    },
  });

  await prisma.property.create({
    data: {
      userId: pro.id,
      nickname: "Lakeview Townhouse",
      addressLine1: "500 Lakeview Dr",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      propertyType: "townhouse",
      units: 1,
      purchasePrice: 310_000,
      purchaseDate: new Date("2022-06-01"),
      currentEstimatedValue: 335_000,
      currentMonthlyRent: 2_550,
      unitRents: [2550],
      bedrooms: 3,
      bathrooms: 2.5,
      currentMonthlyExpenses: 520,
      cashInvested: 62_000,
      notes: "Paid off early. No mortgage.",
    },
  });

  const proProp3 = await prisma.property.create({
    data: {
      userId: pro.id,
      nickname: "Elm 4-Plex",
      addressLine1: "1200 Elm St",
      city: "Fort Worth",
      state: "TX",
      zipCode: "76102",
      propertyType: "multi_family",
      units: 4,
      purchasePrice: 520_000,
      purchaseDate: new Date("2021-09-01"),
      currentEstimatedValue: 595_000,
      currentMonthlyRent: 5_800,
      unitRents: [1400, 1500, 1450, 1450],
      currentMonthlyExpenses: 1_240,
      cashInvested: 104_000,
    },
  });

  await prisma.mortgage.create({
    data: {
      propertyId: proProp3.id,
      originalLoanAmount: 416_000,
      currentBalance: 392_000,
      interestRate: 0.0425,
      termYears: 30,
      startDate: new Date("2021-09-01"),
      monthlyPayment: 2_048,
      escrowIncluded: true,
      lenderName: "US Bank",
      loanType: "conventional",
    },
  });

  const proProp4 = await prisma.property.create({
    data: {
      userId: pro.id,
      nickname: "Downtown Condo",
      addressLine1: "75 Congress Ave",
      addressLine2: "Unit 12",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      propertyType: "condo",
      units: 1,
      purchasePrice: 425_000,
      purchaseDate: new Date("2023-02-01"),
      currentEstimatedValue: 445_000,
      currentMonthlyRent: 3_200,
      unitRents: [3200],
      bedrooms: 2,
      bathrooms: 2,
      currentMonthlyExpenses: 620,
      cashInvested: 85_000,
    },
  });

  await prisma.mortgage.create({
    data: {
      propertyId: proProp4.id,
      originalLoanAmount: 340_000,
      currentBalance: 332_000,
      interestRate: 0.065,
      termYears: 30,
      startDate: new Date("2023-02-01"),
      monthlyPayment: 2_148,
      escrowIncluded: true,
      lenderName: "Bank of America",
      loanType: "conventional",
    },
  });

  await prisma.subscription.create({
    data: {
      userId: pro.id,
      status: "active",
      planName: "pro",
      currentPeriodEnd: new Date("2025-06-01"),
    },
  });

  // ─── PropertySnapshot history for trend indicators (Phase 5) ─────────────
  // Generate 6 months of snapshots for investor and pro accounts so the
  // dashboard trend panel, MoM delta labels, and sparkline are visible.

  type SnapshotPropertyInput = {
    id: string;
    currentEstimatedValue: number;
    currentMonthlyExpenses: number;
    currentMonthlyRent: number;
    unitRents?: number[];
    cashInvested?: number | null;
    ownershipPercent?: number;
    vacancyPercent?: number;
    marketRent?: number | null;
  };

  type SnapshotMortgageInput = {
    originalLoanAmount: number;
    currentBalance: number;
    interestRate: number;
    termYears: number;
    startDate: Date;
    monthlyPayment: number;
    balanceAsOfDate?: Date | null;
    paymentEffectiveDate?: Date | null;
    escrowIncluded?: boolean;
    escrowAmount?: number | null;
  };

  function makeMonthStart(year: number, month: number): Date {
    return new Date(Date.UTC(year, month, 1));
  }

  async function seedSnapshots(
    property: SnapshotPropertyInput,
    mortgages: SnapshotMortgageInput[],
    months: Date[],
    // small value nudge per month to simulate appreciation
    valueNudgePerMonth = 1_500
  ) {
    let runningValue = property.currentEstimatedValue - valueNudgePerMonth * months.length;

    for (const month of months) {
      runningValue += valueNudgePerMonth;
      const snapshotProperty = { ...property, currentEstimatedValue: runningValue };
      const avmApplied = months.indexOf(month) % 2 === 0;

      const data = buildSnapshotData(
        snapshotProperty,
        mortgages.map((m) => ({
          ...m,
          originalLoanAmount: m.originalLoanAmount,
          currentBalance: m.currentBalance,
          balanceAsOfDate: m.balanceAsOfDate ?? null,
          paymentEffectiveDate: m.paymentEffectiveDate ?? null,
          escrowIncluded: m.escrowIncluded ?? false,
          escrowAmount: m.escrowAmount ?? null,
        })),
        {
          valueEstimate: avmApplied ? runningValue + 2_000 : null,
          rentEstimate: null,
          avmValueApplied: avmApplied,
          avmRentApplied: false,
        },
        month
      );

      await prisma.propertySnapshot.upsert({
        where: {
          propertyId_snapshotMonth: {
            propertyId: property.id,
            snapshotMonth: data.snapshotMonth,
          },
        },
        update: {},
        create: data,
      });
    }
  }

  const today = new Date();
  const snapshotMonths = Array.from({ length: 6 }, (_, i) =>
    makeMonthStart(today.getUTCFullYear(), today.getUTCMonth() - 5 + i)
  );

  // Investor — Maple Street SFH (with mortgage)
  await seedSnapshots(
    {
      id: invProp1.id,
      currentEstimatedValue: 355_000,
      currentMonthlyExpenses: 580,
      currentMonthlyRent: 2_650,
      unitRents: [2650],
      cashInvested: 64_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
      marketRent: 2_700,
    },
    [
      {
        originalLoanAmount: 256_000,
        currentBalance: 238_000,
        interestRate: 0.0625,
        termYears: 30,
        startDate: new Date("2021-08-01"),
        monthlyPayment: 1_578,
        paymentEffectiveDate: new Date("2024-01-15"),
        escrowIncluded: true,
      },
    ],
    snapshotMonths
  );

  // Investor — Pine Duplex (with mortgage)
  await seedSnapshots(
    {
      id: invProp2.id,
      currentEstimatedValue: 420_000,
      currentMonthlyExpenses: 720,
      currentMonthlyRent: 3_400,
      unitRents: [1650, 1750],
      cashInvested: 77_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 308_000,
        currentBalance: 298_000,
        interestRate: 0.0675,
        termYears: 30,
        startDate: new Date("2022-11-01"),
        monthlyPayment: 1_992,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    2_000
  );

  // Pro — Riverside SFH (with mortgage, larger appreciation)
  await seedSnapshots(
    {
      id: proProp1.id,
      currentEstimatedValue: 340_000,
      currentMonthlyExpenses: 480,
      currentMonthlyRent: 2_400,
      unitRents: [2400],
      cashInvested: 55_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 220_000,
        currentBalance: 198_000,
        interestRate: 0.0375,
        termYears: 30,
        startDate: new Date("2020-01-15"),
        monthlyPayment: 1_018,
        paymentEffectiveDate: new Date("2024-06-01"),
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    2_500
  );

  // Pro — Elm 4-plex (with mortgage)
  await seedSnapshots(
    {
      id: proProp3.id,
      currentEstimatedValue: 595_000,
      currentMonthlyExpenses: 1_240,
      currentMonthlyRent: 5_800,
      unitRents: [1400, 1500, 1450, 1450],
      cashInvested: 104_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 416_000,
        currentBalance: 392_000,
        interestRate: 0.0425,
        termYears: 30,
        startDate: new Date("2021-09-01"),
        monthlyPayment: 2_048,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    3_500
  );

  // Pro — Downtown Condo (with mortgage, modest appreciation)
  await seedSnapshots(
    {
      id: proProp4.id,
      currentEstimatedValue: 445_000,
      currentMonthlyExpenses: 620,
      currentMonthlyRent: 3_200,
      unitRents: [3200],
      cashInvested: 85_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 340_000,
        currentBalance: 332_000,
        interestRate: 0.065,
        termYears: 30,
        startDate: new Date("2023-02-01"),
        monthlyPayment: 2_148,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    1_000
  );

  console.log("Seed complete. Created 3 test accounts:");
  console.log("  1. Solo Starter (dev@example.com) — 1 property, free tier, no snapshots");
  console.log("  2. Growth Investor (investor@example.com) — 3 properties, investor tier, 6 months of snapshots");
  console.log("  3. Professional Portfolio (pro@example.com) — 5 properties, pro tier, 6 months of snapshots");
  console.log(`  Snapshots seeded for months: ${snapshotMonths.map((m) => m.toISOString().slice(0, 7)).join(", ")}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
