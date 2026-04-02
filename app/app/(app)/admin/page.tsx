import { getAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier } from "@/lib/plans";
import { redirect } from "next/navigation";
import { PRICING_DISPLAY } from "@/lib/pricing-display";
import { LocalDateTime } from "@/components/local-date-time";
import { AdminUserTierSelect } from "./admin-user-tier-select";

export const dynamic = "force-dynamic";

async function getRentCastCount(where: object): Promise<number> {
  try {
    return await prisma.rentCastApiCall.count({ where });
  } catch {
    return 0;
  }
}

export default async function AdminPage() {
  const user = await getAppUser();
  if (!user || !isAdmin(user)) {
    redirect("/");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    userCount,
    propertyCount,
    rentCastCallsThisMonth,
    rentCastCallsAllTime,
    newUsersThisMonth,
    deactivatedCount,
    users,
    planCounts,
    rentCastByUser,
    recentSignups,
    subscriptionStatusCounts,
    lastRentCastCall,
    usersWithPropertiesForAvg,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.property.count(),
    getRentCastCount({ createdAt: { gte: startOfMonth } }),
    getRentCastCount({}),
    prisma.user.count({
      where: { createdAt: { gte: startOfMonth }, deletedAt: null },
    }),
    prisma.user.count({ where: { deletedAt: { not: null } } }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscriptionTierOverride: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { properties: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.user.groupBy({
      by: ["subscriptionTier"],
      where: { deletedAt: null },
      _count: true,
    }),
    prisma.rentCastApiCall
      .groupBy({
        by: ["userId"],
        _count: { id: true },
      })
      .then((r) =>
        r.sort((a, b) => b._count.id - a._count.id).slice(0, 100)
      )
      .catch(() => []),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.rentCastApiCall
      .findFirst({ orderBy: { createdAt: "desc" } })
      .catch(() => null),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { subscriptionTier: true, _count: { select: { properties: true } } },
      take: 500,
    }),
  ]);

  const planBreakdown = planCounts.reduce(
    (acc, p) => {
      acc[p.subscriptionTier] = p._count;
      return acc;
    },
    {} as Record<string, number>
  );

  const investorCount = planBreakdown.investor ?? 0;
  const proCount = planBreakdown.pro ?? 0;
  const mrr =
    investorCount * PRICING_DISPLAY.investorMonthly +
    proCount * PRICING_DISPLAY.proMonthly;

  const propertiesPerPlan = usersWithPropertiesForAvg.reduce(
    (acc, u) => {
      const tier = u.subscriptionTier;
      if (!acc[tier]) acc[tier] = { sum: 0, count: 0 };
      acc[tier].sum += u._count.properties;
      acc[tier].count += 1;
      return acc;
    },
    {} as Record<string, { sum: number; count: number }>
  );

  const avgPropertiesPerPlan = Object.fromEntries(
    Object.entries(propertiesPerPlan).map(([tier, v]) => [
      tier,
      v.count > 0 ? (v.sum / v.count).toFixed(1) : "0",
    ])
  );

  const userIdsForRentCast = [...new Set(rentCastByUser.map((r) => r.userId))];
  const usersForRentCast =
    userIdsForRentCast.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIdsForRentCast } },
          select: { id: true, email: true },
        })
      : [];
  const usersByRentCast = Object.fromEntries(
    usersForRentCast.map((u) => [u.id, u.email])
  );

  const subscriptionBreakdown = subscriptionStatusCounts.reduce(
    (acc, s) => {
      acc[s.status] = s._count;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Overview of users, properties, and API usage.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">Total users</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {userCount}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">New users (this month)</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {newUsersThisMonth}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">Deactivated accounts</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {deactivatedCount}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">Total properties</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {propertyCount}
          </dd>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">Plan breakdown</dt>
          <dd className="mt-1 text-base font-medium text-foreground">
            Free: {planBreakdown.free ?? 0} · Investor: {planBreakdown.investor ?? 0}{" "}
            · Pro: {planBreakdown.pro ?? 0}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">MRR (estimate)</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            ${mrr}/mo
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">Properties per plan (avg)</dt>
          <dd className="mt-1 text-base font-medium text-foreground">
            Free: {avgPropertiesPerPlan.free ?? "0"} · Investor:{" "}
            {avgPropertiesPerPlan.investor ?? "0"} · Pro: {avgPropertiesPerPlan.pro ?? "0"}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">Subscription status</dt>
          <dd className="mt-1 text-base font-medium text-foreground">
            {Object.entries(subscriptionBreakdown)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ") || "—"}
          </dd>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">RentCast calls (this month)</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {rentCastCallsThisMonth}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">RentCast calls (all time)</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {rentCastCallsAllTime}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-medium text-muted">Last RentCast call</dt>
          <dd className="mt-1 text-base font-medium text-foreground">
            {lastRentCastCall ? (
              <LocalDateTime value={lastRentCastCall.createdAt.toISOString()} />
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-end">
          <a
            href="/api/admin/export/users"
            download="admin-users-export.csv"
            className="text-sm font-medium text-accent hover:underline"
          >
            Download users CSV
          </a>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted mb-4">
          Recent signups (last 10)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Signed up
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSignups.map((u) => (
                <tr key={u.email} className="hover:bg-subtle/50">
                  <td className="px-4 py-3 text-sm text-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-muted">
                    <LocalDateTime value={u.createdAt.toISOString()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {rentCastByUser.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-muted mb-4">
            RentCast calls by user
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                    Calls
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rentCastByUser.map((r) => (
                  <tr key={r.userId} className="hover:bg-subtle/50">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {usersByRentCast[r.userId] ?? r.userId}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {r._count.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted mb-4">
          Users (recent 50)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Plan (effective)
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Override
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Properties
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Last active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const effectiveTier = getEffectiveTier(u);
                return (
                  <tr key={u.id} className="hover:bg-subtle/50">
                    <td className="px-4 py-3 text-sm text-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-muted capitalize">
                      {effectiveTier}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <AdminUserTierSelect
                        userId={u.id}
                        currentOverride={u.subscriptionTierOverride}
                        currentTier={effectiveTier}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {u._count.properties}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      <LocalDateTime value={u.updatedAt.toISOString()} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
