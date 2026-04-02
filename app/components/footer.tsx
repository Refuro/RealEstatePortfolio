import Link from "next/link";
import { CookiePreferencesButton } from "@/components/consent/cookie-preferences-button";

type FooterProps = {
  supportEmail?: string | null;
};

export function Footer({ supportEmail }: FooterProps) {
  return (
    <footer className="border-t border-border bg-background px-4 py-6">
      <div className="mx-auto max-w-4xl text-sm text-muted">
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <span className="shrink-0">© {new Date().getFullYear()} Veld Portfolio</span>
          <div className="flex flex-col items-center gap-1.5 md:items-end">
            {/* Nav links: desktop only — mobile has sidebar/landing nav */}
            <div className="hidden flex-wrap justify-end gap-x-6 gap-y-1.5 md:flex">
              <Link href="/tools" className="hover:text-foreground">Calculators</Link>
              <Link href="/changelog" className="hover:text-foreground">Changelog</Link>
              <Link href="/alternatives" className="hover:text-foreground">Alternatives</Link>
              <Link href="/vs" className="hover:text-foreground">Compare</Link>
              <Link href="/resources" className="hover:text-foreground">Resources</Link>
            </div>
            {/* Legal links row — on desktop cookie sits inline here; on mobile it's separated below */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 md:justify-end">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link href="/contact" className="hover:text-foreground">
                {supportEmail && supportEmail.trim() ? "Support" : "Contact"}
              </Link>
              {/* Desktop: cookie inline in the legal row */}
              <span className="hidden md:contents">
                <CookiePreferencesButton className="text-muted hover:text-foreground" />
              </span>
            </div>
            {/* Mobile only: cookie on its own subordinate row */}
            <div className="flex justify-center md:hidden">
              <CookiePreferencesButton className="opacity-70 transition-opacity hover:opacity-100 hover:text-foreground" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
