"use client";

import dynamic from "next/dynamic";
import type { RefinanceMortgageProperty } from "./refinance-workspace";

const RefinanceWorkspace = dynamic(
  () =>
    import("./refinance-workspace").then((mod) => ({
      default: mod.RefinanceWorkspace,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="p-4 text-sm text-muted">Loading refinance workspace…</p>
    ),
  }
);

export function RefinanceWorkspaceLoader(props: {
  properties: RefinanceMortgageProperty[];
  initialSelectedPropertyId?: string;
  initialSelectedMortgageId?: string;
}) {
  return <RefinanceWorkspace {...props} />;
}
