import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddPropertyWizard } from "../add-property-wizard";
import { MarkWelcomeSeen } from "../mark-welcome-seen";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; mode?: string }>;
}) {
  const user = await getAppUser();
  const { from: dealId, mode } = await searchParams;
  const quickAdd = mode === "quick";
  const propertyCount = user
    ? await prisma.property.count({ where: { userId: user.id } })
    : 0;
  // First-time variant applies to the user's first quick-add flow (no properties yet).
  const isFirstAdd = user !== null && quickAdd && !dealId && propertyCount === 0;

  return (
    <div>
      {isFirstAdd && (
        <>
          <MarkWelcomeSeen />
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">
              Add your first property
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Start with the basics. You can add more details later.
            </p>
          </div>
        </>
      )}
      {!isFirstAdd && (
        <>
          <div className="mb-6 flex items-center gap-4">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Properties
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Add property</h1>
        </>
      )}
      {quickAdd ? (
        <p className="mt-1 text-sm text-muted">
          {isFirstAdd
            ? "Address, value, purchase price, rent, and expenses."
            : "Just the essentials — address, value, purchase price, rent, and expenses. You can add full details anytime from the property page."}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">
          Complete each section below, then create your property. Use the links at the top
          to jump between sections.
        </p>
      )}
      {quickAdd && !isFirstAdd && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-foreground">
            Need to add purchase history or detailed property specs?
          </p>
          <Link
            href="/properties/new"
            className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Use the full form
          </Link>
        </div>
      )}
      {!quickAdd && !dealId && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-foreground">
            Just need the basics? Add a property in under a minute.
          </p>
          <Link
            href="/properties/new?mode=quick"
            className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Use quick add
          </Link>
        </div>
      )}
      {dealId && (
        <div className="mt-4 rounded-lg border border-border bg-card p-3">
          <p className="text-sm text-foreground">
            Converting a saved deal into a portfolio property.
          </p>
          <p className="mt-1 text-xs text-muted">
            We prefilled the form from your analyzed deal. Review assumptions before saving.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href={`/analyze?deal=${encodeURIComponent(dealId)}`}
              className="font-medium text-foreground hover:underline"
            >
              Back to analyzed deal
            </Link>
            <span className="text-muted">•</span>
            <Link
              href="/deals"
              className="font-medium text-foreground hover:underline"
            >
              Open saved deals
            </Link>
          </div>
        </div>
      )}
      <div className="mt-6">
        <AddPropertyWizard dealId={dealId ?? undefined} quickAdd={quickAdd} />
      </div>
    </div>
  );
}
