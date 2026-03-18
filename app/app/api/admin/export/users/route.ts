import { NextResponse } from "next/server";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier } from "@/lib/plans";

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const user = await getActiveAppUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      subscriptionTier: true,
      subscriptionTierOverride: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { properties: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "email",
    "firstName",
    "lastName",
    "plan",
    "propertyCount",
    "createdAt",
    "lastActive",
  ];

  const rows = users.map((u) => [
    escapeCsvCell(u.email),
    escapeCsvCell(u.firstName),
    escapeCsvCell(u.lastName),
    escapeCsvCell(getEffectiveTier(u)),
    escapeCsvCell(u._count.properties),
    escapeCsvCell(u.createdAt.toISOString()),
    escapeCsvCell(u.updatedAt.toISOString()),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="admin-users-export.csv"',
    },
  });
}
