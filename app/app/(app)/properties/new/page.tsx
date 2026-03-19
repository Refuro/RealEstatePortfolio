import Link from "next/link";
import { AddPropertyWizard } from "../add-property-wizard";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from: dealId } = await searchParams;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/properties"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Properties
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Add property</h1>
      <p className="mt-1 text-sm text-muted">
        Complete each section below, then create your property. Use the links at the top to jump between sections.
      </p>
      {dealId && (
        <div className="mt-4 rounded-lg border border-border/70 bg-card/90 p-3">
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
        <AddPropertyWizard dealId={dealId ?? undefined} />
      </div>
    </div>
  );
}
