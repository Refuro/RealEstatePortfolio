import Link from "next/link";

type SupportContactInstructionsProps = {
  supportEmail: string | null;
};

/**
 * Explains how to reach support: footer email when configured, otherwise /contact (no broken mailto expectation).
 */
export function SupportContactInstructions({ supportEmail }: SupportContactInstructionsProps) {
  const hasEmail = Boolean(supportEmail?.trim());
  if (hasEmail) {
    return <>contact us at the support email listed in the app footer.</>;
  }
  return (
    <>
      use the{" "}
      <Link href="/contact" className="font-medium text-foreground underline-offset-4 hover:underline">
        contact form
      </Link>{" "}
      or the Contact link in the footer — a public support email is not listed in this environment.
    </>
  );
}
