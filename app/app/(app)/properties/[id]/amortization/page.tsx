import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AmortizationChartDynamic } from "../amortization-chart-dynamic";

export default async function AmortizationPage({
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

  const address = [property.addressLine1, property.addressLine2, property.city, property.state, property.zipCode]
    .filter(Boolean)
    .join(", ");
  const displayName = property.nickname || address || "Property";

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Property
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
      {address && property.nickname && (
        <p className="mt-0.5 text-sm text-muted">{address}</p>
      )}

      <div className="mt-8">
        <p className="mb-4 text-sm text-muted">
          Original mortgage terms. Not affected by scenario.
        </p>
        <AmortizationChartDynamic propertyId={property.id} />
      </div>
    </div>
  );
}
