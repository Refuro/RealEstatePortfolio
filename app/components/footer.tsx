import Link from "next/link";

type FooterProps = {
  supportEmail?: string | null;
};

export function Footer({ supportEmail }: FooterProps) {
  return (
    <footer className="border-t border-border bg-background px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-sm text-muted">
        {supportEmail && supportEmail.trim() && (
          <a
            href={`mailto:${supportEmail.trim()}`}
            className="hover:text-foreground"
          >
            Support
          </a>
        )}
        <Link href="/privacy" className="hover:text-foreground">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
