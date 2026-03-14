import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PropertyForm } from "../../property-form";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;

  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
  });

  if (!property) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/properties/${id}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Property detail
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Edit property</h1>
      <p className="mt-1 text-sm text-muted">
        Update the property details below.
      </p>
      <PropertyForm
        className="mt-6"
        property={{
          id: property.id,
          nickname: property.nickname ?? undefined,
          addressLine1: property.addressLine1,
          addressLine2: property.addressLine2 ?? undefined,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          propertyType: property.propertyType,
          units: property.units,
          ownershipPercent: property.ownershipPercent ?? 100,
          purchasePrice: property.purchasePrice.toString(),
          purchaseDate: property.purchaseDate.toISOString().slice(0, 10),
          currentEstimatedValue: property.currentEstimatedValue.toString(),
          currentMonthlyRent: property.currentMonthlyRent.toString(),
          currentMonthlyExpenses: property.currentMonthlyExpenses.toString(),
          cashInvested: property.cashInvested?.toString(),
          notes: property.notes ?? undefined,
        }}
      />
    </div>
  );
}
