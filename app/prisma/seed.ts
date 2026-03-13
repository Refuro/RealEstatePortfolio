import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a dev user (replace with real Clerk ID when testing with auth)
  const user = await prisma.user.upsert({
    where: { clerkUserId: "dev-user-1" },
    update: {},
    create: {
      clerkUserId: "dev-user-1",
      email: "dev@example.com",
      subscriptionTier: "free",
    },
  });

  await prisma.property.create({
    data: {
      userId: user.id,
      nickname: "123 Main St",
      addressLine1: "123 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      propertyType: "single_family",
      units: 1,
      purchasePrice: 250_000,
      purchaseDate: new Date("2022-06-01"),
      currentEstimatedValue: 280_000,
      currentMonthlyRent: 2_200,
      currentMonthlyExpenses: 450,
      cashInvested: 50_000,
    },
  });

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
