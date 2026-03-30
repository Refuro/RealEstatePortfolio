"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

type LandingNavProps = {
  userId: string | null;
  landingVariant?: string;
};

export function LandingNav({ userId, landingVariant }: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = (
    <>
      {userId && (
        <Link
          href="/dashboard"
          className="text-muted hover:text-foreground"
          onClick={() => setMobileMenuOpen(false)}
        >
          Dashboard
        </Link>
      )}
      <Link
        href="/investment-property-calculator"
        className="text-muted hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Calculator
      </Link>
      <Link
        href="/pricing"
        className="text-muted hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Pricing
      </Link>
      <Link
        href="/privacy"
        className="text-muted hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Privacy
      </Link>
      <Link
        href="/terms"
        className="text-muted hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Terms
      </Link>
      <Link
        href="/changelog"
        className="text-muted hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Changelog
      </Link>
      {!userId && (
        <>
          <Link
            href="/sign-in"
            className="text-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign in
          </Link>
          <FunnelCtaLink
            href="/sign-up?intent=free"
            placement="landing_nav"
            ctaId="sign_up"
            planIntent="free"
            landingVariant={landingVariant}
            className="block w-full rounded-lg bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground hover:bg-accent-hover md:inline-block md:w-auto md:py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign up
          </FunnelCtaLink>
        </>
      )}
    </>
  );

  return (
    <nav className="border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Veld
        </Link>

        {/* Desktop: horizontal nav */}
        <div className="hidden items-center gap-6 text-sm md:flex">{navLinks}</div>

        {/* Mobile: hamburger or close */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Mobile slide-out drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 border-l border-border bg-background shadow-sm transition-transform md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-muted">Menu</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-5 px-6 py-6 text-base">
          {navLinks}
        </div>
      </div>
    </nav>
  );
}
