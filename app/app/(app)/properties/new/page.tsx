import Link from "next/link";
import { PropertyForm } from "../property-form";

export default function NewPropertyPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/properties"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Properties
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-zinc-900">Add property</h1>
      <p className="mt-1 text-zinc-600">
        Enter the property details below.
      </p>
      <PropertyForm className="mt-6" />
    </div>
  );
}
