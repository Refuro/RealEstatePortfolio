import Link from "next/link";

type FooterProps = {
  supportEmail?: string | null;
};

export function Footer({ supportEmail }: FooterProps) {
  return (
    <footer className="border-t border-border bg-background px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-sm text-muted">
        <span>© 2025 Veld Portfolio</span>
        <Link
          href="/contact"
          className="hover:text-foreground"
        >
          {supportEmail && supportEmail.trim() ? "Support" : "Contact"}
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          Terms of Service
        </Link>
        <Link href="/changelog" className="hover:text-foreground">
          Changelog
        </Link>
      </div>
    </footer>
  );
}
