"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { AppNav } from "./app-nav";
import { DraftProvider, useDraft } from "./draft-context";
import { OverLimitBanner } from "./components/over-limit-banner";
import { PastDueBanner } from "./components/past-due-banner";
import { OnboardingPanel } from "./onboarding-panel";
import { Footer } from "@/components/footer";

const BILLING_SYNC_KEY = "billing-sync-last";
const BILLING_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 min
function LogoLink() {
  const pathname = usePathname();
  const draft = useDraft();
  const useNavigateTo = draft != null && pathname === "/properties/new" && draft.hasDraft;
  if (useNavigateTo) {
    return (
      <button
        type="button"
        onClick={() => draft.navigateTo("/dashboard")}
        className="flex min-w-0 flex-1 items-center justify-center md:justify-start"
      >
        <span className="text-lg font-semibold text-foreground">Veld</span>
      </button>
    );
  }
  return (
    <Link
      href="/dashboard"
      className="flex min-w-0 flex-1 items-center justify-center md:justify-start"
    >
      <span className="text-lg font-semibold text-foreground">Veld</span>
    </Link>
  );
}

export function AppLayoutClient({
  children,
  showAdmin,
  supportEmail,
  bannerProps,
  onboardingProps,
}: {
  children: React.ReactNode;
  user?: { id: string; email: string } | null;
  showAdmin: boolean;
  supportEmail?: string | null;
  bannerProps?: {
    propertyCount: number;
    dealCount: number;
    propertyLimit: number;
    dealLimit: number;
    overLimit: boolean;
    subscriptionStatus: string | null;
    stripeCustomerId: string | null;
    subscriptionTier: string;
  };
  onboardingProps?: {
    welcomeSeenAt: string | null;
    dismissedAt: string | null;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (
      !bannerProps?.stripeCustomerId ||
      (bannerProps.subscriptionTier ?? "free").toLowerCase() === "free"
    ) {
      return;
    }
    const last = sessionStorage.getItem(BILLING_SYNC_KEY);
    const lastTs = last ? parseInt(last, 10) : 0;
    if (Date.now() - lastTs < BILLING_SYNC_INTERVAL_MS) return;

    let cancelled = false;
    fetch("/api/billing/sync")
      .then((res) => res.json())
      .then((data: { synced?: boolean; tier?: string }) => {
        if (cancelled) return;
        sessionStorage.setItem(BILLING_SYNC_KEY, String(Date.now()));
        if (data.synced && data.tier === "free") {
          router.refresh();
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bannerProps?.stripeCustomerId, bannerProps?.subscriptionTier, router]);

  useEffect(() => {
    const id = setTimeout(() => setDrawerOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (drawerOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [drawerOpen]);

  return (
    <DraftProvider>
    <div className="flex min-h-screen bg-background">
      {/* Mobile top bar - visible only on < md */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex size-10 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-subtle"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div onClick={closeDrawer} className="min-w-0 flex-1">
          <LogoLink />
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Desktop sidebar - hidden on < md */}
      <aside className="hidden md:flex w-56 xl:w-64 2xl:w-72 flex-col border-r border-border bg-card sticky top-0 h-screen overflow-y-auto">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <LogoLink />
        </div>
        <AppNav
          showAdmin={showAdmin}
          propertyCount={bannerProps?.propertyCount ?? 0}
        />
        <div className="mt-auto border-t border-border px-4 py-4">
          <div className="flex items-center gap-2 rounded-md px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-muted">Account</span>
          </div>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      <div
        role="button"
        tabIndex={-1}
        onClick={closeDrawer}
        className={`fixed inset-0 z-50 bg-foreground/20 transition-opacity md:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!drawerOpen}
      />

      {/* Mobile slide-out drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-56 flex-col border-r border-border bg-card transition-transform duration-200 ease-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4" onClick={closeDrawer}>
          <LogoLink />
        </div>
        <AppNav
          onClose={closeDrawer}
          showAdmin={showAdmin}
          propertyCount={bannerProps?.propertyCount ?? 0}
        />
        <div className="mt-auto border-t border-border px-4 py-4">
          <div className="flex items-center gap-2 rounded-md px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-muted">Account</span>
          </div>
        </div>
      </aside>

      {/* Main content + footer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-4 pt-20 md:p-6 md:pt-6">
          <div className="mx-auto max-w-4xl xl:max-w-6xl 2xl:max-w-7xl space-y-4">
            {bannerProps && (
              <>
                <PastDueBanner subscriptionStatus={bannerProps.subscriptionStatus} />
                <OverLimitBanner
                  propertyCount={bannerProps.propertyCount}
                  dealCount={bannerProps.dealCount}
                  propertyLimit={bannerProps.propertyLimit}
                  dealLimit={bannerProps.dealLimit}
                  overLimit={bannerProps.overLimit}
                />
              </>
            )}
            {onboardingProps && <OnboardingPanel initialProgress={onboardingProps} />}
            {children}
          </div>
        </main>
        <Footer supportEmail={supportEmail} />
      </div>
    </div>
    </DraftProvider>
  );
}
