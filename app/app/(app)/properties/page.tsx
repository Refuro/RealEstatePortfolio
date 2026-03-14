import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PropertiesPage() {
  const user = await getAppUser();
  if (!user) return null;

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  type PropertyItem = (typeof properties)[number];
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Properties</h1>
        <Link
          href="/properties/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Add property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-zinc-900">No properties yet</h2>
          <p className="mt-2 text-zinc-600">
            Add your first property to start tracking value, equity, cash flow, and more.
          </p>
          <Link
            href="/properties/new"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {properties.map((p: PropertyItem) => (
            <li key={p.id}>
              <Link
                href={`/properties/${p.id}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="font-medium text-zinc-900">
                  {p.nickname || p.addressLine1}
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  {p.addressLine1}
                  {p.city && `, ${p.city} ${p.state} ${p.zipCode}`}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
