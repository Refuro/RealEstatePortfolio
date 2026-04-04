"use client";

import { useEffect, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDraft } from "./draft-context";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Calculator,
  ClipboardList,
  SlidersHorizontal,
  Landmark,
  TrendingDown,
  CreditCard,
  Settings,
  Shield,
  Plus,
} from "lucide-react";

const portfolioNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
];

const toolsNav = [
  { href: "/modeling", label: "Modeling", icon: SlidersHorizontal },
  { href: "/mortgage", label: "Mortgage", icon: Landmark },
  { href: "/refinance", label: "Refinance", icon: TrendingDown },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/analyze", label: "Analyze deal", icon: ClipboardList },
  { href: "/deals", label: "Deals", icon: Briefcase },
];

const accountNav = [
  { href: "/plans", label: "Plans", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppNavProps {
  onClose?: () => void;
  onOpenMobileMenu?: () => void;
  showAdmin?: boolean;
  propertyCount?: number;
}

function NavGroup({
  label,
  items,
  pathname,
  onClose,
  useDraftNav,
  draft,
}: {
  label?: string;
  items: {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string; size?: number }>;
  }[];
  pathname: string;
  onClose?: () => void;
  useDraftNav: boolean;
  draft: ReturnType<typeof useDraft>;
}) {
  return (
    <div>
      {label && (
        <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
      )}
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        const baseClass = `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm w-full text-left transition-colors duration-100`;
        const activeClass = `${baseClass} bg-subtle font-medium text-foreground border-l-2 border-accent`;
        const inactiveClass = `${baseClass} text-muted hover:bg-subtle hover:text-foreground`;
        const className = isActive ? activeClass : inactiveClass;

        if (useDraftNav) {
          return (
            <button
              key={href}
              type="button"
              onClick={() => {
                draft?.navigateTo(href);
                onClose?.();
              }}
              className={className}
            >
              <Icon size={16} />
              {itemLabel}
            </button>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={className}
          >
            <Icon size={16} />
            {itemLabel}
          </Link>
        );
      })}
    </div>
  );
}

export function AppNav({
  onClose,
  onOpenMobileMenu,
  showAdmin,
  propertyCount = 0,
}: AppNavProps) {
  const pathname = usePathname();
  const draft = useDraft();
  const useNavigateTo =
    draft != null && pathname === "/properties/new" && draft.hasDraft;

  const adminItems = showAdmin
    ? [{ href: "/admin", label: "Admin", icon: Shield }]
    : [];

  useEffect(() => {
    if (!onOpenMobileMenu) return;
    const handler = () => onOpenMobileMenu();
    document.addEventListener("open-mobile-menu", handler);
    return () => document.removeEventListener("open-mobile-menu", handler);
  }, [onOpenMobileMenu]);

  return (
    <nav className="flex flex-1 flex-col gap-0 overflow-y-auto py-2">
      <NavGroup
        items={portfolioNav}
        pathname={pathname}
        onClose={onClose}
        useDraftNav={useNavigateTo}
        draft={draft}
      />
      <NavGroup
        label="Tools"
        items={toolsNav}
        pathname={pathname}
        onClose={onClose}
        useDraftNav={useNavigateTo}
        draft={draft}
      />
      <NavGroup
        label="Account"
        items={[...accountNav, ...adminItems]}
        pathname={pathname}
        onClose={onClose}
        useDraftNav={useNavigateTo}
        draft={draft}
      />

      <div className="mt-auto border-t border-border px-3 pb-2 pt-3">
        {useNavigateTo ? (
          <button
            type="button"
            onClick={() => {
              draft?.navigateTo("/properties/new");
              onClose?.();
            }}
            className="flex w-full items-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors duration-100 hover:bg-accent/15"
          >
            <Plus size={14} />
            {propertyCount === 0 ? "Getting started" : "Add property"}
          </button>
        ) : (
          <Link
            href="/properties/new"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors duration-100 hover:bg-accent/15"
          >
            <Plus size={14} />
            {propertyCount === 0 ? "Getting started" : "Add property"}
          </Link>
        )}
      </div>
    </nav>
  );
}
