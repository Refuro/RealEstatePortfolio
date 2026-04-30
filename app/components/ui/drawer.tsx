"use client";

import { type ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Drawer as Vaul } from "vaul";
import { X } from "lucide-react";
import { useIsMobile } from "@/lib/use-is-mobile";

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title shown in the header. Pass a string for the default styling, or a node for custom layout. */
  title?: ReactNode;
  /** Optional subtitle / step counter rendered below the title. */
  subtitle?: ReactNode;
  /** Body content. Scrolls when content overflows. */
  children: ReactNode;
  /** Sticky footer slot — primary/secondary actions live here. */
  footer?: ReactNode;
  /** Optional className applied to the panel wrapper. */
  className?: string;
};

/**
 * Mobile uses Vaul (drag-to-dismiss bottom sheet). Desktop uses Radix Dialog
 * with a keyframe slide-in animation defined in globals.css.
 *
 * **Blur note (mobile):** the original blur came from `backdrop-blur-sm` on
 * the overlay — backdrop-filter on a parent stacking context degrades the
 * compositing quality of elements above it. The overlay now uses a flat
 * darken (`bg-foreground/40`), no filter. Vaul's panel keeps its own
 * compositor layer for the slide-in but settles at integer pixel positions,
 * so text renders crisply once at rest. We do **not** add any extra
 * transform/will-change hints here — that would stack with Vaul's own
 * transform and re-introduce the blur.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  className = "",
}: DrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileBottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        subtitle={subtitle}
        footer={footer}
        className={className}
      >
        {children}
      </MobileBottomSheet>
    );
  }

  return (
    <DesktopSideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      subtitle={subtitle}
      footer={footer}
      className={className}
    >
      {children}
    </DesktopSideDrawer>
  );
}

function HeaderRow({
  title,
  subtitle,
  onClose,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
      <div className="min-w-0 flex-1">
        {subtitle && (
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-warning">
            {subtitle}
          </div>
        )}
        {title && (
          <div className="mt-1 text-lg font-semibold leading-tight text-foreground">
            {title}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function DesktopSideDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  className,
}: DrawerProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-foreground/40" />
        <RadixDialog.Content
          className={`drawer-panel-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-xl outline-none ${className ?? ""}`}
        >
          <RadixDialog.Title asChild>
            <span className="sr-only">{typeof title === "string" ? title : "Drawer"}</span>
          </RadixDialog.Title>
          <HeaderRow title={title} subtitle={subtitle} onClose={() => onOpenChange(false)} />
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
          {footer && (
            <div className="border-t border-border bg-card px-6 py-3">{footer}</div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

function MobileBottomSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  className,
}: DrawerProps) {
  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange}>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-40 bg-foreground/40" />
        <Vaul.Content
          className={`fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[80vh] flex-col rounded-t-2xl bg-card outline-none ${className ?? ""}`}
        >
          <Vaul.Title asChild>
            <span className="sr-only">{typeof title === "string" ? title : "Drawer"}</span>
          </Vaul.Title>
          {/* Wrapping the visual handle in Vaul.Handle gives a guaranteed
              drag-target even when the form body below scrolls — without it,
              long forms (e.g. Property facts) hijack the drag gesture for
              scroll and the sheet feels un-dismissable. */}
          <Vaul.Handle className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-border" />
          <HeaderRow title={title} subtitle={subtitle} onClose={() => onOpenChange(false)} />
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
          {footer && (
            <div className="border-t border-border bg-card px-6 py-3">{footer}</div>
          )}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
