import Link from "next/link";
import { AddPropertyWizard } from "../add-property-wizard";

export default function NewPropertyPage() {
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
        Follow the steps below to add your property.
      </p>
      <div className="mt-6">
        <AddPropertyWizard />
      </div>
    </div>
  );
}
