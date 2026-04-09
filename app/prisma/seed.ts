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

const SEED_CLERK_IDS = ["user_3C6InYM1m3T3Iw2gwn3TlUgtAqv", "user_3C6IjWn0sEsFUo0vwkmjwCM3D92", "user_3C6IrE2VutbSXJji5bHnKi5pNfK", "user_3C83fueJLkv29PPcfR3MpcBhNED", "user_3C83hYmfU5gE9zlyoqMOxDS9MSO"] as const;

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

  // ─── Account 4: Mid-Size Landlord (10 properties, Pro tier) ─────────────
  // Use case: Growing TX landlord with a diversified 10-property portfolio.
  const mid = await prisma.user.create({
    data: {
      clerkUserId: "user_3C83fueJLkv29PPcfR3MpcBhNED",
      email: "morgan@example.com",
      firstName: "Morgan",
      lastName: "Midsize",
      subscriptionTier: "pro",
    },
  });

  const midProp1 = await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "Arlington SFH",
      addressLine1: "811 Elm Crest Dr",
      city: "Arlington",
      state: "TX",
      zipCode: "76011",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 285_000,
      purchaseDate: new Date("2019-04-01"),
      currentEstimatedValue: 350_000,
      currentMonthlyRent: 2_400,
      unitRents: [2400],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 520,
      cashInvested: 57_000,
      hasMortgage: false,
      notes: "Paid off. Anchor property.",
    },
  });

  const midProp2 = await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "Plano SFH",
      addressLine1: "4200 Coit Rd",
      city: "Plano",
      state: "TX",
      zipCode: "75024",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 410_000,
      purchaseDate: new Date("2020-09-01"),
      currentEstimatedValue: 480_000,
      currentMonthlyRent: 3_100,
      unitRents: [3100],
      bedrooms: 4,
      bathrooms: 3,
      currentMonthlyExpenses: 680,
      cashInvested: 82_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: midProp2.id,
      originalLoanAmount: 328_000,
      currentBalance: 308_000,
      interestRate: 0.0350,
      termYears: 30,
      startDate: new Date("2020-09-01"),
      monthlyPayment: 1_474,
      escrowIncluded: true,
      lenderName: "Rocket Mortgage",
      loanType: "conventional",
    },
  });

  const midProp3 = await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "Houston Duplex",
      addressLine1: "3300 Westheimer Rd",
      addressLine2: "Units A & B",
      city: "Houston",
      state: "TX",
      zipCode: "77098",
      propertyType: "multi_family",
      units: 2,
      purchasePrice: 420_000,
      purchaseDate: new Date("2021-03-01"),
      currentEstimatedValue: 465_000,
      currentMonthlyRent: 3_600,
      unitRents: [1750, 1850],
      currentMonthlyExpenses: 780,
      cashInvested: 84_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: midProp3.id,
      originalLoanAmount: 336_000,
      currentBalance: 322_000,
      interestRate: 0.0400,
      termYears: 30,
      startDate: new Date("2021-03-01"),
      monthlyPayment: 1_604,
      escrowIncluded: true,
      lenderName: "Wells Fargo",
      loanType: "conventional",
    },
  });

  const midProp4 = await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "South Austin SFH",
      addressLine1: "2512 S Lamar Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 380_000,
      purchaseDate: new Date("2022-02-01"),
      currentEstimatedValue: 415_000,
      currentMonthlyRent: 2_900,
      unitRents: [2900],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 620,
      cashInvested: 76_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: midProp4.id,
      originalLoanAmount: 304_000,
      currentBalance: 296_000,
      interestRate: 0.0550,
      termYears: 30,
      startDate: new Date("2022-02-01"),
      monthlyPayment: 1_727,
      escrowIncluded: true,
      lenderName: "Chase",
      loanType: "conventional",
    },
  });

  await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "East Austin Condo",
      addressLine1: "1600 E 6th St",
      addressLine2: "Unit 305",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      propertyType: "condo",
      units: 1,
      purchasePrice: 320_000,
      purchaseDate: new Date("2021-07-01"),
      currentEstimatedValue: 345_000,
      currentMonthlyRent: 2_500,
      unitRents: [2500],
      bedrooms: 2,
      bathrooms: 2,
      currentMonthlyExpenses: 550,
      cashInvested: 64_000,
      notes: "Paid cash. HOA $280/mo included in expenses.",
    },
  });

  const midProp6 = await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "Uptown Dallas Townhouse",
      addressLine1: "3810 McKinney Ave",
      city: "Dallas",
      state: "TX",
      zipCode: "75204",
      propertyType: "townhouse",
      units: 1,
      purchasePrice: 390_000,
      purchaseDate: new Date("2022-05-01"),
      currentEstimatedValue: 420_000,
      currentMonthlyRent: 2_750,
      unitRents: [2750],
      bedrooms: 3,
      bathrooms: 2.5,
      currentMonthlyExpenses: 590,
      cashInvested: 78_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: midProp6.id,
      originalLoanAmount: 312_000,
      currentBalance: 304_000,
      interestRate: 0.0575,
      termYears: 30,
      startDate: new Date("2022-05-01"),
      monthlyPayment: 1_820,
      escrowIncluded: true,
      lenderName: "PNC Bank",
      loanType: "conventional",
    },
  });

  await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "Round Rock SFH",
      addressLine1: "900 University Blvd",
      city: "Round Rock",
      state: "TX",
      zipCode: "78665",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 315_000,
      purchaseDate: new Date("2020-06-01"),
      currentEstimatedValue: 370_000,
      currentMonthlyRent: 2_450,
      unitRents: [2450],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 510,
      cashInvested: 63_000,
      notes: "Refinanced and paid off 2023.",
    },
  });

  const midProp8 = await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "Fort Worth 4-Plex",
      addressLine1: "500 W 7th St",
      city: "Fort Worth",
      state: "TX",
      zipCode: "76102",
      propertyType: "multi_family",
      units: 4,
      purchasePrice: 580_000,
      purchaseDate: new Date("2021-10-01"),
      currentEstimatedValue: 650_000,
      currentMonthlyRent: 6_200,
      unitRents: [1500, 1550, 1550, 1600],
      currentMonthlyExpenses: 1_350,
      cashInvested: 116_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: midProp8.id,
      originalLoanAmount: 464_000,
      currentBalance: 444_000,
      interestRate: 0.0425,
      termYears: 30,
      startDate: new Date("2021-10-01"),
      monthlyPayment: 2_285,
      escrowIncluded: true,
      lenderName: "Truist",
      loanType: "conventional",
    },
  });

  const midProp9 = await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "McKinney SFH",
      addressLine1: "1420 Eldorado Pkwy",
      city: "McKinney",
      state: "TX",
      zipCode: "75070",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 360_000,
      purchaseDate: new Date("2023-01-01"),
      currentEstimatedValue: 385_000,
      currentMonthlyRent: 2_700,
      unitRents: [2700],
      bedrooms: 4,
      bathrooms: 2.5,
      currentMonthlyExpenses: 570,
      cashInvested: 72_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: midProp9.id,
      originalLoanAmount: 288_000,
      currentBalance: 284_000,
      interestRate: 0.0650,
      termYears: 30,
      startDate: new Date("2023-01-01"),
      monthlyPayment: 1_822,
      escrowIncluded: true,
      lenderName: "US Bank",
      loanType: "conventional",
    },
  });

  await prisma.property.create({
    data: {
      userId: mid.id,
      nickname: "San Antonio Condo",
      addressLine1: "200 E Grayson St",
      addressLine2: "Unit 401",
      city: "San Antonio",
      state: "TX",
      zipCode: "78215",
      propertyType: "condo",
      units: 1,
      purchasePrice: 275_000,
      purchaseDate: new Date("2022-08-01"),
      currentEstimatedValue: 295_000,
      currentMonthlyRent: 2_100,
      unitRents: [2100],
      bedrooms: 2,
      bathrooms: 2,
      currentMonthlyExpenses: 450,
      cashInvested: 55_000,
      notes: "HOA $320/mo included in expenses.",
    },
  });

  await prisma.subscription.create({
    data: {
      userId: mid.id,
      status: "active",
      planName: "pro",
      currentPeriodEnd: new Date("2025-08-01"),
    },
  });

  // ─── Account 5: Large Portfolio (20 properties, Pro tier) ─────────────────
  // Use case: Experienced multi-state investor across TX, FL, AZ, and CO.
  const large = await prisma.user.create({
    data: {
      clerkUserId: "user_3C83hYmfU5gE9zlyoqMOxDS9MSO",
      email: "riley@example.com",
      firstName: "Riley",
      lastName: "Portfolio",
      subscriptionTier: "pro",
    },
  });

  // --- TX (6 properties) ---
  const largeProp1 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Travis Heights SFH",
      addressLine1: "1802 S Congress Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 450_000,
      purchaseDate: new Date("2018-06-01"),
      currentEstimatedValue: 580_000,
      currentMonthlyRent: 3_500,
      unitRents: [3500],
      bedrooms: 4,
      bathrooms: 3,
      currentMonthlyExpenses: 750,
      cashInvested: 90_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp1.id,
      originalLoanAmount: 360_000,
      currentBalance: 318_000,
      interestRate: 0.0425,
      termYears: 30,
      startDate: new Date("2018-06-01"),
      monthlyPayment: 1_775,
      escrowIncluded: true,
      lenderName: "Chase",
      loanType: "conventional",
    },
  });

  const largeProp2 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Deep Ellum 4-Plex",
      addressLine1: "2900 Main St",
      city: "Dallas",
      state: "TX",
      zipCode: "75226",
      propertyType: "multi_family",
      units: 4,
      purchasePrice: 620_000,
      purchaseDate: new Date("2020-03-01"),
      currentEstimatedValue: 720_000,
      currentMonthlyRent: 7_200,
      unitRents: [1750, 1800, 1800, 1850],
      currentMonthlyExpenses: 1_500,
      cashInvested: 124_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp2.id,
      originalLoanAmount: 496_000,
      currentBalance: 468_000,
      interestRate: 0.0350,
      termYears: 30,
      startDate: new Date("2020-03-01"),
      monthlyPayment: 2_228,
      escrowIncluded: true,
      lenderName: "Wells Fargo",
      loanType: "conventional",
    },
  });

  await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Montrose SFH",
      addressLine1: "1900 Westheimer Rd",
      city: "Houston",
      state: "TX",
      zipCode: "77098",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 380_000,
      purchaseDate: new Date("2019-09-01"),
      currentEstimatedValue: 460_000,
      currentMonthlyRent: 3_000,
      unitRents: [3000],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 640,
      cashInvested: 76_000,
      notes: "Paid off 2023.",
    },
  });

  const largeProp4 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Pearl District SFH",
      addressLine1: "302 E Josephine St",
      city: "San Antonio",
      state: "TX",
      zipCode: "78215",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 295_000,
      purchaseDate: new Date("2021-05-01"),
      currentEstimatedValue: 340_000,
      currentMonthlyRent: 2_400,
      unitRents: [2400],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 500,
      cashInvested: 59_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp4.id,
      originalLoanAmount: 236_000,
      currentBalance: 224_000,
      interestRate: 0.0400,
      termYears: 30,
      startDate: new Date("2021-05-01"),
      monthlyPayment: 1_127,
      escrowIncluded: true,
      lenderName: "Rocket Mortgage",
      loanType: "conventional",
    },
  });

  const largeProp5 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Sundance Sq Duplex",
      addressLine1: "600 Houston St",
      addressLine2: "Units 1 & 2",
      city: "Fort Worth",
      state: "TX",
      zipCode: "76102",
      propertyType: "multi_family",
      units: 2,
      purchasePrice: 440_000,
      purchaseDate: new Date("2022-01-01"),
      currentEstimatedValue: 480_000,
      currentMonthlyRent: 4_000,
      unitRents: [2000, 2000],
      currentMonthlyExpenses: 850,
      cashInvested: 88_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp5.id,
      originalLoanAmount: 352_000,
      currentBalance: 344_000,
      interestRate: 0.0550,
      termYears: 30,
      startDate: new Date("2022-01-01"),
      monthlyPayment: 1_999,
      escrowIncluded: true,
      lenderName: "Bank of America",
      loanType: "conventional",
    },
  });

  const largeProp6 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "2nd Street Condo",
      addressLine1: "200 Congress Ave",
      addressLine2: "Unit 1802",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      propertyType: "condo",
      units: 1,
      purchasePrice: 510_000,
      purchaseDate: new Date("2023-03-01"),
      currentEstimatedValue: 535_000,
      currentMonthlyRent: 3_800,
      unitRents: [3800],
      bedrooms: 2,
      bathrooms: 2,
      currentMonthlyExpenses: 820,
      cashInvested: 102_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp6.id,
      originalLoanAmount: 408_000,
      currentBalance: 402_000,
      interestRate: 0.0680,
      termYears: 30,
      startDate: new Date("2023-03-01"),
      monthlyPayment: 2_660,
      escrowIncluded: true,
      lenderName: "Truist",
      loanType: "conventional",
    },
  });

  // --- FL (5 properties) ---
  const largeProp7 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Hyde Park Tampa SFH",
      addressLine1: "700 S Willow Ave",
      city: "Tampa",
      state: "FL",
      zipCode: "33606",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 420_000,
      purchaseDate: new Date("2020-07-01"),
      currentEstimatedValue: 510_000,
      currentMonthlyRent: 3_200,
      unitRents: [3200],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 700,
      cashInvested: 84_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp7.id,
      originalLoanAmount: 336_000,
      currentBalance: 314_000,
      interestRate: 0.0350,
      termYears: 30,
      startDate: new Date("2020-07-01"),
      monthlyPayment: 1_509,
      escrowIncluded: true,
      lenderName: "PNC Bank",
      loanType: "conventional",
    },
  });

  const largeProp8 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Brickell Condo",
      addressLine1: "1000 S Miami Ave",
      addressLine2: "Unit 3204",
      city: "Miami",
      state: "FL",
      zipCode: "33130",
      propertyType: "condo",
      units: 1,
      purchasePrice: 580_000,
      purchaseDate: new Date("2021-01-01"),
      currentEstimatedValue: 650_000,
      currentMonthlyRent: 4_200,
      unitRents: [4200],
      bedrooms: 2,
      bathrooms: 2,
      currentMonthlyExpenses: 900,
      cashInvested: 116_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp8.id,
      originalLoanAmount: 464_000,
      currentBalance: 446_000,
      interestRate: 0.0400,
      termYears: 30,
      startDate: new Date("2021-01-01"),
      monthlyPayment: 2_215,
      escrowIncluded: true,
      lenderName: "Chase",
      loanType: "conventional",
    },
  });

  await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Thornton Park SFH",
      addressLine1: "800 E Washington St",
      city: "Orlando",
      state: "FL",
      zipCode: "32801",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 375_000,
      purchaseDate: new Date("2019-11-01"),
      currentEstimatedValue: 455_000,
      currentMonthlyRent: 2_900,
      unitRents: [2900],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 620,
      cashInvested: 75_000,
      notes: "Paid off 2024.",
    },
  });

  const largeProp10 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Riverside Jacksonville Townhouse",
      addressLine1: "1400 Riverside Ave",
      city: "Jacksonville",
      state: "FL",
      zipCode: "32204",
      propertyType: "townhouse",
      units: 1,
      purchasePrice: 310_000,
      purchaseDate: new Date("2022-04-01"),
      currentEstimatedValue: 345_000,
      currentMonthlyRent: 2_500,
      unitRents: [2500],
      bedrooms: 3,
      bathrooms: 2.5,
      currentMonthlyExpenses: 540,
      cashInvested: 62_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp10.id,
      originalLoanAmount: 248_000,
      currentBalance: 242_000,
      interestRate: 0.0550,
      termYears: 30,
      startDate: new Date("2022-04-01"),
      monthlyPayment: 1_408,
      escrowIncluded: true,
      lenderName: "Rocket Mortgage",
      loanType: "conventional",
    },
  });

  const largeProp11 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Siesta Key Area SFH",
      addressLine1: "5200 Ocean Blvd",
      city: "Sarasota",
      state: "FL",
      zipCode: "34231",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 490_000,
      purchaseDate: new Date("2021-06-01"),
      currentEstimatedValue: 565_000,
      currentMonthlyRent: 3_600,
      unitRents: [3600],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 760,
      cashInvested: 98_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp11.id,
      originalLoanAmount: 392_000,
      currentBalance: 374_000,
      interestRate: 0.0400,
      termYears: 30,
      startDate: new Date("2021-06-01"),
      monthlyPayment: 1_871,
      escrowIncluded: true,
      lenderName: "US Bank",
      loanType: "conventional",
    },
  });

  // --- AZ (5 properties) ---
  const largeProp12 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Old Town Scottsdale SFH",
      addressLine1: "4200 N Scottsdale Rd",
      city: "Scottsdale",
      state: "AZ",
      zipCode: "85251",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 520_000,
      purchaseDate: new Date("2020-02-01"),
      currentEstimatedValue: 620_000,
      currentMonthlyRent: 3_800,
      unitRents: [3800],
      bedrooms: 4,
      bathrooms: 3,
      currentMonthlyExpenses: 800,
      cashInvested: 104_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp12.id,
      originalLoanAmount: 416_000,
      currentBalance: 390_000,
      interestRate: 0.0350,
      termYears: 30,
      startDate: new Date("2020-02-01"),
      monthlyPayment: 1_868,
      escrowIncluded: true,
      lenderName: "Wells Fargo",
      loanType: "conventional",
    },
  });

  await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Arcadia Phoenix SFH",
      addressLine1: "3800 E Camelback Rd",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85018",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 360_000,
      purchaseDate: new Date("2021-08-01"),
      currentEstimatedValue: 420_000,
      currentMonthlyRent: 2_700,
      unitRents: [2700],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 590,
      cashInvested: 72_000,
      notes: "Paid off 2024.",
    },
  });

  const largeProp14 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Mill Ave Tempe Townhouse",
      addressLine1: "600 S Mill Ave",
      city: "Tempe",
      state: "AZ",
      zipCode: "85281",
      propertyType: "townhouse",
      units: 1,
      purchasePrice: 380_000,
      purchaseDate: new Date("2022-03-01"),
      currentEstimatedValue: 415_000,
      currentMonthlyRent: 2_800,
      unitRents: [2800],
      bedrooms: 3,
      bathrooms: 2.5,
      currentMonthlyExpenses: 600,
      cashInvested: 76_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp14.id,
      originalLoanAmount: 304_000,
      currentBalance: 296_000,
      interestRate: 0.0550,
      termYears: 30,
      startDate: new Date("2022-03-01"),
      monthlyPayment: 1_726,
      escrowIncluded: true,
      lenderName: "Bank of America",
      loanType: "conventional",
    },
  });

  const largeProp15 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Mesa SFH",
      addressLine1: "1100 W University Dr",
      city: "Mesa",
      state: "AZ",
      zipCode: "85201",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 340_000,
      purchaseDate: new Date("2020-10-01"),
      currentEstimatedValue: 410_000,
      currentMonthlyRent: 2_600,
      unitRents: [2600],
      bedrooms: 3,
      bathrooms: 2,
      currentMonthlyExpenses: 560,
      cashInvested: 68_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp15.id,
      originalLoanAmount: 272_000,
      currentBalance: 254_000,
      interestRate: 0.0375,
      termYears: 30,
      startDate: new Date("2020-10-01"),
      monthlyPayment: 1_260,
      escrowIncluded: true,
      lenderName: "Chase",
      loanType: "conventional",
    },
  });

  const largeProp16 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Chandler Condo",
      addressLine1: "900 N Arizona Ave",
      addressLine2: "Unit 220",
      city: "Chandler",
      state: "AZ",
      zipCode: "85225",
      propertyType: "condo",
      units: 1,
      purchasePrice: 290_000,
      purchaseDate: new Date("2021-04-01"),
      currentEstimatedValue: 325_000,
      currentMonthlyRent: 2_200,
      unitRents: [2200],
      bedrooms: 2,
      bathrooms: 2,
      currentMonthlyExpenses: 480,
      cashInvested: 58_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp16.id,
      originalLoanAmount: 232_000,
      currentBalance: 220_000,
      interestRate: 0.0400,
      termYears: 30,
      startDate: new Date("2021-04-01"),
      monthlyPayment: 1_108,
      escrowIncluded: true,
      lenderName: "Rocket Mortgage",
      loanType: "conventional",
    },
  });

  // --- CO (4 properties) ---
  const largeProp17 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Capitol Hill Denver SFH",
      addressLine1: "1400 E 13th Ave",
      city: "Denver",
      state: "CO",
      zipCode: "80218",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 520_000,
      purchaseDate: new Date("2019-05-01"),
      currentEstimatedValue: 660_000,
      currentMonthlyRent: 3_600,
      unitRents: [3600],
      bedrooms: 4,
      bathrooms: 2.5,
      currentMonthlyExpenses: 780,
      cashInvested: 104_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp17.id,
      originalLoanAmount: 416_000,
      currentBalance: 374_000,
      interestRate: 0.0425,
      termYears: 30,
      startDate: new Date("2019-05-01"),
      monthlyPayment: 2_048,
      escrowIncluded: true,
      lenderName: "Wells Fargo",
      loanType: "conventional",
    },
  });

  const largeProp18 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Boulder SFH",
      addressLine1: "3200 Broadway",
      city: "Boulder",
      state: "CO",
      zipCode: "80304",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 650_000,
      purchaseDate: new Date("2020-08-01"),
      currentEstimatedValue: 790_000,
      currentMonthlyRent: 4_200,
      unitRents: [4200],
      bedrooms: 4,
      bathrooms: 3,
      currentMonthlyExpenses: 890,
      cashInvested: 130_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp18.id,
      originalLoanAmount: 520_000,
      currentBalance: 490_000,
      interestRate: 0.0350,
      termYears: 30,
      startDate: new Date("2020-08-01"),
      monthlyPayment: 2_335,
      escrowIncluded: true,
      lenderName: "US Bank",
      loanType: "conventional",
    },
  });

  const largeProp19 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Colorado Springs Townhouse",
      addressLine1: "700 N Nevada Ave",
      city: "Colorado Springs",
      state: "CO",
      zipCode: "80903",
      propertyType: "townhouse",
      units: 1,
      purchasePrice: 390_000,
      purchaseDate: new Date("2022-07-01"),
      currentEstimatedValue: 425_000,
      currentMonthlyRent: 2_800,
      unitRents: [2800],
      bedrooms: 3,
      bathrooms: 2.5,
      currentMonthlyExpenses: 620,
      cashInvested: 78_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp19.id,
      originalLoanAmount: 312_000,
      currentBalance: 304_000,
      interestRate: 0.0575,
      termYears: 30,
      startDate: new Date("2022-07-01"),
      monthlyPayment: 1_820,
      escrowIncluded: true,
      lenderName: "PNC Bank",
      loanType: "conventional",
    },
  });

  const largeProp20 = await prisma.property.create({
    data: {
      userId: large.id,
      nickname: "Fort Collins SFH",
      addressLine1: "2100 S College Ave",
      city: "Fort Collins",
      state: "CO",
      zipCode: "80525",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 450_000,
      purchaseDate: new Date("2021-09-01"),
      currentEstimatedValue: 530_000,
      currentMonthlyRent: 3_200,
      unitRents: [3200],
      bedrooms: 4,
      bathrooms: 2,
      currentMonthlyExpenses: 700,
      cashInvested: 90_000,
    },
  });
  await prisma.mortgage.create({
    data: {
      propertyId: largeProp20.id,
      originalLoanAmount: 360_000,
      currentBalance: 340_000,
      interestRate: 0.0400,
      termYears: 30,
      startDate: new Date("2021-09-01"),
      monthlyPayment: 1_719,
      escrowIncluded: true,
      lenderName: "Bank of America",
      loanType: "conventional",
    },
  });

  await prisma.subscription.create({
    data: {
      userId: large.id,
      status: "active",
      planName: "pro",
      currentPeriodEnd: new Date("2025-10-01"),
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

  // Mid — Arlington SFH (no mortgage)
  await seedSnapshots(
    {
      id: midProp1.id,
      currentEstimatedValue: 350_000,
      currentMonthlyExpenses: 520,
      currentMonthlyRent: 2_400,
      unitRents: [2400],
      cashInvested: 57_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [],
    snapshotMonths,
    1_200
  );

  // Mid — Plano SFH (with mortgage)
  await seedSnapshots(
    {
      id: midProp2.id,
      currentEstimatedValue: 480_000,
      currentMonthlyExpenses: 680,
      currentMonthlyRent: 3_100,
      unitRents: [3100],
      cashInvested: 82_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 328_000,
        currentBalance: 308_000,
        interestRate: 0.0350,
        termYears: 30,
        startDate: new Date("2020-09-01"),
        monthlyPayment: 1_474,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    2_000
  );

  // Mid — Fort Worth 4-Plex (with mortgage)
  await seedSnapshots(
    {
      id: midProp8.id,
      currentEstimatedValue: 650_000,
      currentMonthlyExpenses: 1_350,
      currentMonthlyRent: 6_200,
      unitRents: [1500, 1550, 1550, 1600],
      cashInvested: 116_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 464_000,
        currentBalance: 444_000,
        interestRate: 0.0425,
        termYears: 30,
        startDate: new Date("2021-10-01"),
        monthlyPayment: 2_285,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    3_000
  );

  // Large — Travis Heights Austin SFH (with mortgage)
  await seedSnapshots(
    {
      id: largeProp1.id,
      currentEstimatedValue: 580_000,
      currentMonthlyExpenses: 750,
      currentMonthlyRent: 3_500,
      unitRents: [3500],
      cashInvested: 90_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 360_000,
        currentBalance: 318_000,
        interestRate: 0.0425,
        termYears: 30,
        startDate: new Date("2018-06-01"),
        monthlyPayment: 1_775,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    2_500
  );

  // Large — Hyde Park Tampa SFH (with mortgage)
  await seedSnapshots(
    {
      id: largeProp7.id,
      currentEstimatedValue: 510_000,
      currentMonthlyExpenses: 700,
      currentMonthlyRent: 3_200,
      unitRents: [3200],
      cashInvested: 84_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 336_000,
        currentBalance: 314_000,
        interestRate: 0.0350,
        termYears: 30,
        startDate: new Date("2020-07-01"),
        monthlyPayment: 1_509,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    2_000
  );

  // Large — Capitol Hill Denver SFH (with mortgage)
  await seedSnapshots(
    {
      id: largeProp17.id,
      currentEstimatedValue: 660_000,
      currentMonthlyExpenses: 780,
      currentMonthlyRent: 3_600,
      unitRents: [3600],
      cashInvested: 104_000,
      ownershipPercent: 100,
      vacancyPercent: 5,
    },
    [
      {
        originalLoanAmount: 416_000,
        currentBalance: 374_000,
        interestRate: 0.0425,
        termYears: 30,
        startDate: new Date("2019-05-01"),
        monthlyPayment: 2_048,
        escrowIncluded: true,
      },
    ],
    snapshotMonths,
    3_000
  );

  console.log("Seed complete. Created 5 test accounts:");
  console.log("  1. Solo Starter (dev@example.com) — 1 property, free tier, no snapshots");
  console.log("  2. Growth Investor (investor@example.com) — 3 properties, investor tier, 6 months of snapshots");
  console.log("  3. Professional Portfolio (pro@example.com) — 5 properties, pro tier, 6 months of snapshots");
  console.log("  4. Mid-Size Landlord (morgan@example.com) — 10 properties, pro tier, 6 months of snapshots");
  console.log("  5. Large Portfolio (riley@example.com) — 20 properties, pro tier, 6 months of snapshots");
  console.log(`  Snapshots seeded for months: ${snapshotMonths.map((m) => m.toISOString().slice(0, 7)).join(", ")}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
