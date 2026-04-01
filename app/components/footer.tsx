import Link from "next/link";
import { CookiePreferencesButton } from "@/components/consent/cookie-preferences-button";

type FooterProps = {
  supportEmail?: string | null;
};

export function Footer({ supportEmail }: FooterProps) {
  return (
    <footer className="border-t border-border bg-background px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-sm text-muted">
        <span>© {new Date().getFullYear()} Veld Portfolio</span>
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
        <Link href="/tools" className="hover:text-foreground">
          Calculators
        </Link>
        <Link href="/alternatives" className="hover:text-foreground">
          Alternatives
        </Link>
        <Link href="/vs" className="hover:text-foreground">
          Compare
        </Link>
        <Link href="/resources" className="hover:text-foreground">
          Resources
        </Link>
        <CookiePreferencesButton />
      </div>
    </footer>
  );
}
