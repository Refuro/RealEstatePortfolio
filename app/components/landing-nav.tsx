"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { persistLandingVariantFromPageView } from "@/lib/landing-variant-attribution";

type LandingNavProps = {
  userId: string | null;
  landingVariant?: string;
};

export function LandingNav({ userId, landingVariant }: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  useEffect(() => {
    persistLandingVariantFromPageView(landingVariant);
  }, [landingVariant]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen, closeMenu]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const panel = drawerRef.current;
    const first = panel?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const t = window.setTimeout(() => first?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const navLinks = (
    <>
      {userId && (
        <Link
          href="/dashboard"
          className="text-muted transition-colors duration-150 hover:text-foreground"
          onClick={() => setMobileMenuOpen(false)}
        >
          Dashboard
        </Link>
      )}
      <Link
        href="/tools"
        className="text-muted transition-colors duration-150 hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Calculators
      </Link>
      <Link
        href="/pricing"
        className="text-muted transition-colors duration-150 hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Pricing
      </Link>
      <Link
        href="/changelog"
        className="text-muted transition-colors duration-150 hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Changelog
      </Link>
      {!userId && (
        <>
          <Link
            href="/sign-in"
            className="text-muted transition-colors duration-150 hover:text-foreground"
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
            className="block w-full rounded-lg bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover md:inline-block md:w-auto md:py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign up
          </FunnelCtaLink>
        </>
      )}
    </>
  );

  return (
    <nav className="w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Image
            src="/favicon.svg"
            width={24}
            height={24}
            className="size-6 shrink-0 object-contain"
            alt=""
            aria-hidden
          />
          Veld
        </Link>

        {/* Desktop: horizontal nav */}
        <div className="hidden items-center gap-6 text-sm md:flex">{navLinks}</div>

        {/* Mobile: hamburger or close */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => (mobileMenuOpen ? closeMenu() : openMenu())}
          className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="landing-nav-drawer"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
      {/* Mobile slide-out drawer */}
      <div
        ref={drawerRef}
        id="landing-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-y-0 right-0 z-50 w-64 border-l border-border bg-background shadow-sm transition-transform md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-muted">Menu</span>
          <button
            type="button"
            onClick={closeMenu}
            className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-5 px-6 py-6 text-base">{navLinks}</div>
      </div>
    </nav>
  );
}
