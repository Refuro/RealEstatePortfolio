"use client";

import { useMemo, useState } from "react";
import { Fragment } from "react";
import { LocalDateTime } from "@/components/local-date-time";
import { AdminUserTierSelect } from "./admin-user-tier-select";
import { AdminUserTrialControls } from "./admin-user-trial-controls";

export type AdminUserRow = {
  id: string;
  email: string;
  effectiveTier: string;
  subscriptionTierOverride: string | null;
  propertiesCount: number;
  trialState: string;
  lastActiveIso: string;
};

export function AdminUsersTab({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((u) => u.email.toLowerCase().includes(normalized));
  }, [users, query]);

  return (
    <section>
      <h2 className="mb-4 text-sm font-medium text-muted">Users (recent 50)</h2>

      <div className="mb-4">
        <label htmlFor="admin-user-search" className="mb-1 block text-sm font-medium text-muted">
          Search by email
        </label>
        <input
          id="admin-user-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground transition-colors duration-150 placeholder:text-muted md:max-w-sm md:text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Plan (effective)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Properties</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Trial state</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Last active</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((u) => {
              const expanded = expandedUserId === u.id;
              return (
                <Fragment key={u.id}>
                  <tr className="hover:bg-subtle/50">
                    <td className="px-4 py-3 text-sm text-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-muted capitalize">{u.effectiveTier}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{u.propertiesCount}</td>
                    <td className="px-4 py-3 text-sm text-muted">{u.trialState}</td>
                    <td className="px-4 py-3 text-sm text-muted">
                      <LocalDateTime value={u.lastActiveIso} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={() => setExpandedUserId(expanded ? null : u.id)}
                        className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
                        aria-expanded={expanded}
                        aria-controls={`admin-user-actions-${u.id}`}
                      >
                        {expanded ? "Hide actions" : "Show actions"}
                      </button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr id={`admin-user-actions-${u.id}`} className="bg-subtle/30">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-3">
                          <div>
                            <p className="mb-2 text-xs font-medium text-muted">Tier override</p>
                            <AdminUserTierSelect
                              userId={u.id}
                              currentOverride={u.subscriptionTierOverride}
                              currentTier={u.effectiveTier}
                            />
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-medium text-muted">Trial and billing tools</p>
                            <AdminUserTrialControls userId={u.id} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-muted">
                  No users match that email search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
