import { getAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getEffectiveTier,
  hasTrialExpired,
  isOnTrial,
  trialDaysRemaining,
} from "@/lib/plans";
import { redirect } from "next/navigation";
import { PRICING_DISPLAY } from "@/lib/pricing-display";
import { LocalDateTime } from "@/components/local-date-time";
import { MetricCard } from "@/components/metric-card";
import { AdminEmailTools } from "./admin-email-tools";
import { AdminTabs } from "./admin-tabs";
import { AdminUsersTab, type AdminUserRow } from "./admin-users-tab";

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
        trialStartedAt: true,
        trialEndsAt: true,
        trialEmailsSentAt: true,
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
        by: ["userId", "userEmail"],
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

  const userIdsForRentCast = [
    ...new Set(
      rentCastByUser
        .map((r) => r.userId)
        .filter((id): id is string => typeof id === "string")
    ),
  ];
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

  const trialStartedCount = users.filter((u) => u.trialStartedAt !== null).length;
  const trialExpiredCount = users.filter((u) => hasTrialExpired(u)).length;
  const trialConvertedCount = users.filter(
    (u) =>
      u.trialStartedAt !== null &&
      (u.subscriptionTier ?? "free").toLowerCase() !== "free"
  ).length;

  const emailSentCounts = users.reduce(
    (acc, u) => {
      const flags =
        u.trialEmailsSentAt && typeof u.trialEmailsSentAt === "object"
          ? (u.trialEmailsSentAt as Record<string, unknown>)
          : null;
      if (flags?.day10) acc.day10 += 1;
      if (flags?.day13) acc.day13 += 1;
      if (flags?.expired) acc.expired += 1;
      return acc;
    },
    { day10: 0, day13: 0, expired: 0 }
  );

  const adminUsers: AdminUserRow[] = users.map((u) => {
    const effectiveTier = getEffectiveTier(u);
    const onTrial = isOnTrial(u);
    const trialExpired = hasTrialExpired(u);
    const daysLeft = trialDaysRemaining(u);
    const trialState = onTrial
      ? `Active · ${daysLeft ?? 0} day${(daysLeft ?? 0) === 1 ? "" : "s"} left`
      : trialExpired
        ? "Expired"
        : "None";

    return {
      id: u.id,
      email: u.email,
      effectiveTier,
      subscriptionTierOverride: u.subscriptionTierOverride,
      propertiesCount: u._count.properties,
      trialState,
      lastActiveIso: u.updatedAt.toISOString(),
    };
  });

  const overviewContent = (
    <>
      <section>
        <h2 className="mb-3 text-xs font-medium text-muted">Users and Revenue</h2>
        <div className="rounded-xl bg-subtle/30 p-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="col-span-2">
              <MetricCard label="MRR (estimate)" value={`$${mrr}/mo`} compact />
            </div>
            <MetricCard label="Total users" value={`${userCount}`} compact />
            <MetricCard label="New users (this month)" value={`${newUsersThisMonth}`} compact />
            <MetricCard label="Properties" value={`${propertyCount}`} compact />
          </div>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="mb-3 text-xs font-medium text-muted">Plan and Subscription</h2>
        <div className="rounded-xl bg-subtle/30 p-2">
          <dl className="grid grid-cols-2 gap-2">
            <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
              <dt className="text-xs font-medium text-muted">Plan breakdown</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-foreground">
                Free: {planBreakdown.free ?? 0} · Investor: {planBreakdown.investor ?? 0} · Pro:{" "}
                {planBreakdown.pro ?? 0}
              </dd>
            </div>
            <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
              <dt className="text-xs font-medium text-muted">Subscription status</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {Object.entries(subscriptionBreakdown)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ") || "—"}
              </dd>
            </div>
            <MetricCard label="Deactivated accounts" value={`${deactivatedCount}`} compact />
            <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
              <dt className="text-xs font-medium text-muted">Properties per plan (avg)</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-foreground">
                Free: {avgPropertiesPerPlan.free ?? "0"} · Investor: {avgPropertiesPerPlan.investor ?? "0"}
                {" · "}Pro: {avgPropertiesPerPlan.pro ?? "0"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="mb-3 text-xs font-medium text-muted">Properties and API</h2>
        <div className="rounded-xl bg-subtle/30 p-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetricCard label="RentCast calls (this month)" value={`${rentCastCallsThisMonth}`} compact />
            <MetricCard label="RentCast calls (all time)" value={`${rentCastCallsAllTime}`} compact />
            <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
              <dt className="text-xs font-medium text-muted">Last RentCast call</dt>
              <dd className="mt-1 truncate text-sm font-medium text-foreground">
                {lastRentCastCall ? (
                  <LocalDateTime value={lastRentCastCall.createdAt.toISOString()} />
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
              <dt className="text-xs font-medium text-muted">Export</dt>
              <dd className="mt-1">
                <a
                  href="/api/admin/export/users"
                  download="admin-users-export.csv"
                  className="text-sm font-medium text-accent transition-colors duration-150 hover:underline"
                >
                  Download users CSV
                </a>
              </dd>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="mb-3 text-xs font-medium text-muted">Trial Funnel</h2>
        <div className="rounded-xl bg-subtle/30 p-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
              <dt className="text-xs font-medium text-muted">Trial funnel</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium tabular-nums">
                <span className="text-foreground">Started: {trialStartedCount}</span>
                <span className="text-negative">Expired: {trialExpiredCount}</span>
                <span className="text-positive">Converted: {trialConvertedCount}</span>
              </dd>
            </div>
            <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
              <dt className="text-xs font-medium text-muted">Trial emails sent</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-foreground">
                Day 10: {emailSentCounts.day10} · Day 13: {emailSentCounts.day13} · Expired:{" "}
                {emailSentCounts.expired}
              </dd>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-muted">Recent signups (last 10)</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Signed up</th>
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
    </>
  );

  const usersContent = <AdminUsersTab users={adminUsers} />;

  const apiUsageContent = (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <dt className="text-sm font-medium text-muted">RentCast calls (this month)</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {rentCastCallsThisMonth}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <dt className="text-sm font-medium text-muted">RentCast calls (all time)</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {rentCastCallsAllTime}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <dt className="text-sm font-medium text-muted">Last RentCast call</dt>
          <dd className="mt-1 text-base font-medium text-foreground">
            {lastRentCastCall ? (
              <LocalDateTime value={lastRentCastCall.createdAt.toISOString()} />
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="flex items-end rounded-lg border border-border bg-card p-4 shadow-sm">
          <a
            href="/api/admin/export/users"
            download="admin-users-export.csv"
            className="text-sm font-medium text-accent transition-colors duration-150 hover:underline"
          >
            Download users CSV
          </a>
        </div>
      </div>

      {rentCastByUser.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-medium text-muted">RentCast calls by user</h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rentCastByUser.map((r, index) => (
                  <tr key={`${r.userId ?? "none"}-${r.userEmail ?? "unknown"}-${index}`} className="hover:bg-subtle/50">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {r.userId
                        ? (usersByRentCast[r.userId] ?? r.userEmail ?? r.userId)
                        : (r.userEmail ?? "Deleted user")}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{r._count.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-lg border border-border bg-card p-6 text-sm text-muted shadow-sm">
          No RentCast calls yet.
        </section>
      )}
    </>
  );

  const testToolsContent = (
    <div>
      <AdminEmailTools isOptedOut={user.onboardingEmailsOptedOutAt !== null} />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Overview of users, properties, and API usage.
      </p>
      <AdminTabs
        tabs={[
          { id: "overview", label: "Overview", content: overviewContent },
          { id: "users", label: "Users", content: usersContent },
          { id: "api-usage", label: "API Usage", content: apiUsageContent },
          { id: "test-tools", label: "Test Tools", content: testToolsContent },
        ]}
      />
    </div>
  );
}
