"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { MortgageForm, type MortgageInitial } from "@/components/properties/forms/mortgage-form";
import {
  InvestmentDetailsForm,
  type InvestmentDetailsInitial,
} from "@/components/properties/forms/investment-details-form";
import {
  PropertyFactsForm,
  type PropertyFactsInitial,
} from "@/components/properties/forms/property-facts-form";
import {
  FinancialInputsForm,
  type FinancialInputsInitial,
} from "@/components/properties/forms/financial-inputs-form";
import { RentForm, type RentInitial } from "@/components/properties/forms/rent-form";
import { initialSubformState, type SubformState } from "@/components/properties/forms/types";

export type EditSection =
  | "mortgage"
  | "investment-details"
  | "property-facts"
  | "financial-inputs"
  | "rent";

const SECTION_TITLES: Record<EditSection, string> = {
  mortgage: "Edit mortgage",
  "investment-details": "Edit investment details",
  "property-facts": "Edit property facts",
  "financial-inputs": "Edit financial inputs",
  rent: "Edit rent",
};

const VALID_SECTIONS: EditSection[] = [
  "mortgage",
  "investment-details",
  "property-facts",
  "financial-inputs",
  "rent",
];

// ─── Wizard step model ──────────────────────────────────────────────────────
// Per Decision #3: only mortgage + investment-details are scored, so only those
// two are wizard steps. Rent and property-facts are single-section edits only.

type WizardStepId = "mortgage" | "investment-details";

const WIZARD_ORDER: WizardStepId[] = ["mortgage", "investment-details"];

const WIZARD_TITLES: Record<WizardStepId, string> = {
  mortgage: "Mortgage",
  "investment-details": "Investment details",
};

const WIZARD_UNLOCKS: Record<WizardStepId, string> = {
  mortgage: "Unlocks DSCR, LTV, and refinance modeling.",
  "investment-details": "Unlocks accurate equity and cash-on-cash return.",
};

const WIZARD_FORM_ID = "edit-drawer-wizard-form";
const SAVE_INDICATOR_MIN_MS = 200;

function isWizardSection(section: EditSection): section is WizardStepId {
  return section === "mortgage" || section === "investment-details";
}

function isStepIncomplete(stepId: WizardStepId, missingFields: string[]): boolean {
  if (stepId === "mortgage") {
    return (
      missingFields.includes("mortgage details") ||
      missingFields.includes("mortgage status")
    );
  }
  return (
    missingFields.includes("actual purchase price") ||
    missingFields.includes("cash invested")
  );
}

function computeQueue(missingFields: string[]): WizardStepId[] {
  return WIZARD_ORDER.filter((s) => isStepIncomplete(s, missingFields));
}

export type EditDrawerInitialData = {
  mortgage: MortgageInitial;
  investmentDetails: InvestmentDetailsInitial;
  propertyFacts: PropertyFactsInitial;
  financialInputs: FinancialInputsInitial;
  rent: RentInitial;
};

export type EditDrawerProps = {
  propertyId: string;
  initial: EditDrawerInitialData;
  /** Latest completeness — drives wizard step queue + advance logic. */
  completeness: { score: number; missingFields: string[] };
};

function parseSection(value: string | null): EditSection | null {
  if (!value) return null;
  return (VALID_SECTIONS as string[]).includes(value) ? (value as EditSection) : null;
}

type Intent = "continue" | "close";
type IndicatorPhase = "idle" | "saving" | "saved";

export function EditDrawer({ propertyId, initial, completeness }: EditDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const wizardParam = searchParams.get("wizard");
  const section = parseSection(editParam);
  const open = section != null;
  const wizardRequested = wizardParam === "1";

  // Wizard mode is only honored when current section is a wizard step.
  const wizardActive = wizardRequested && section != null && isWizardSection(section);

  // ─── Step queue (frozen at open) ─────────────────────────────────────────
  const [queue, setQueue] = useState<WizardStepId[]>([]);
  const wasOpenRef = useRef(false);

  // ─── Save state indicator + intent ───────────────────────────────────────
  const [subformState, setSubformState] = useState<SubformState>(initialSubformState);
  const [indicator, setIndicator] = useState<IndicatorPhase>("idle");
  const [intent, setIntent] = useState<Intent | null>(null);
  const intentRef = useRef<Intent | null>(null);
  const savingStartedAtRef = useRef<number | null>(null);
  const prevSavingRef = useRef(false);
  const prevSavedRef = useRef(false);
  const completenessRef = useRef(completeness);

  useEffect(() => {
    intentRef.current = intent;
  }, [intent]);
  useEffect(() => {
    completenessRef.current = completeness;
  }, [completeness]);

  // ─── Navigation helpers ──────────────────────────────────────────────────
  const closeDrawer = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("edit");
    params.delete("wizard");
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "?", { scroll: false });
  }, [router, searchParams]);

  const navigateToSection = useCallback(
    (next: EditSection, keepWizard: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("edit", next);
      if (keepWizard) params.set("wizard", "1");
      else params.delete("wizard");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const advanceTimerRef = useRef<number | null>(null);
  const cancelAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current != null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // ─── Reset on open / close transitions ───────────────────────────────────
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      // Drawer just opened — compute the queue (wizard) and reset state.
      if (wizardActive) {
        const computed = computeQueue(completenessRef.current.missingFields);
        setQueue(computed);
        // If the requested section is already complete, jump to first incomplete.
        if (
          section &&
          isWizardSection(section) &&
          !computed.includes(section)
        ) {
          if (computed.length > 0) {
            navigateToSection(computed[0], true);
          } else {
            closeDrawer();
          }
          return;
        }
      } else {
        setQueue([]);
      }
      setIntent(wizardActive ? "continue" : "close");
      setIndicator("idle");
      setSubformState(initialSubformState);
      savingStartedAtRef.current = null;
      prevSavingRef.current = false;
      prevSavedRef.current = false;
      cancelAdvanceTimer();
      wasOpenRef.current = true;
    } else if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;
      setQueue([]);
      setIntent(null);
      setIndicator("idle");
      setSubformState(initialSubformState);
      savingStartedAtRef.current = null;
      prevSavingRef.current = false;
      prevSavedRef.current = false;
      cancelAdvanceTimer();
    }
    // section is included so reopening at a different wizard step recomputes intent.
  }, [open, wizardActive, section, cancelAdvanceTimer, navigateToSection, closeDrawer]);

  // Section change within an open drawer (wizard advance) is handled by keying
  // the rendered form on `section`, which remounts it. The form's initial
  // onStateChange fires with the reset state, which lets handleStateChange
  // sync subformState back to idle. The indicator clears on the next save.

  // ─── Advance logic ───────────────────────────────────────────────────────
  const advanceOrClose = useCallback(() => {
    if (!wizardActive || !section || !isWizardSection(section)) {
      closeDrawer();
      return;
    }
    const currentIdx = queue.findIndex((s) => s === section);
    const fresh = completenessRef.current.missingFields;
    for (let i = currentIdx + 1; i < queue.length; i++) {
      const candidate = queue[i];
      if (isStepIncomplete(candidate, fresh)) {
        navigateToSection(candidate, true);
        return;
      }
    }
    closeDrawer();
  }, [wizardActive, section, queue, navigateToSection, closeDrawer]);

  // ─── Subform state handler ───────────────────────────────────────────────
  useEffect(() => () => cancelAdvanceTimer(), [cancelAdvanceTimer]);

  const handleStateChange = useCallback(
    (s: SubformState) => {
      setSubformState(s);
      const wasSaving = prevSavingRef.current;
      const wasSaved = prevSavedRef.current;

      if (s.saving && !wasSaving) {
        savingStartedAtRef.current = Date.now();
        setIndicator("saving");
      }

      if (s.saved && !wasSaved) {
        const elapsed = Date.now() - (savingStartedAtRef.current ?? 0);
        const remaining = Math.max(0, SAVE_INDICATOR_MIN_MS - elapsed);
        setIndicator("saved");

        // Refresh server data immediately so the next step receives fresh props.
        router.refresh();

        if (advanceTimerRef.current != null) {
          window.clearTimeout(advanceTimerRef.current);
        }
        advanceTimerRef.current = window.setTimeout(() => {
          advanceTimerRef.current = null;
          // Read intent at fire-time, not at handler-bind-time.
          const action = intentRef.current ?? "close";
          if (action === "continue") {
            advanceOrClose();
          } else {
            closeDrawer();
          }
        }, remaining);
      }

      // Clear the indicator when a freshly-mounted form reports a clean state
      // (e.g., after the wizard advances and the next step's form mounts).
      if (!s.saving && !s.saved && !s.error && (wasSaving || wasSaved)) {
        setIndicator("idle");
      }

      prevSavingRef.current = s.saving;
      prevSavedRef.current = s.saved;
    },
    [router, advanceOrClose, closeDrawer]
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) closeDrawer();
    },
    [closeDrawer]
  );

  const handleCancel = useCallback(() => closeDrawer(), [closeDrawer]);

  // ─── Skip ────────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (!wizardActive || !section || !isWizardSection(section)) {
      closeDrawer();
      return;
    }
    const currentIdx = queue.findIndex((s) => s === section);
    const fresh = completenessRef.current.missingFields;
    for (let i = currentIdx + 1; i < queue.length; i++) {
      const candidate = queue[i];
      if (isStepIncomplete(candidate, fresh)) {
        navigateToSection(candidate, true);
        return;
      }
    }
    // No further incomplete step — close.
    closeDrawer();
  }, [wizardActive, section, queue, navigateToSection, closeDrawer]);

  // ─── Header / footer / body ──────────────────────────────────────────────
  const wizardCurrentIdx = useMemo(
    () => (section && isWizardSection(section) ? queue.indexOf(section) : -1),
    [section, queue]
  );
  const wizardStepNumber = wizardCurrentIdx >= 0 ? wizardCurrentIdx + 1 : 0;
  const wizardTotal = queue.length;
  const isLastStep =
    wizardActive && wizardTotal > 0 && wizardCurrentIdx === wizardTotal - 1;

  const title = useMemo(() => {
    if (!section) return undefined;
    if (wizardActive && isWizardSection(section)) {
      return WIZARD_TITLES[section];
    }
    return SECTION_TITLES[section];
  }, [section, wizardActive]);

  const subtitle = useMemo(() => {
    if (!wizardActive || wizardStepNumber === 0) return undefined;
    const pct = wizardTotal > 0 ? (wizardStepNumber / wizardTotal) * 100 : 0;
    return (
      <span className="flex items-center gap-3">
        <span>{`Step ${wizardStepNumber} of ${wizardTotal}`}</span>
        <span
          className="inline-block h-[3px] w-16 overflow-hidden rounded-full"
          style={{
            background: "color-mix(in srgb, var(--warning) 18%, var(--border))",
          }}
          aria-hidden
        >
          <span
            className="block h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: "var(--warning)",
            }}
          />
        </span>
      </span>
    );
  }, [wizardActive, wizardStepNumber, wizardTotal]);

  // `formKey` is passed directly via `key={formKey}` on each form (React 19
  // forbids spreading `key` through props). Bumping the key when `section`
  // changes remounts the form so its initial state syncs with the new section.
  const formKey = section ?? "none";
  const subformProps = useMemo(
    () => ({
      propertyId,
      hideActions: wizardActive,
      onStateChange: handleStateChange,
      onCancel: handleCancel,
      formId: wizardActive ? WIZARD_FORM_ID : undefined,
    }),
    [propertyId, wizardActive, handleStateChange, handleCancel]
  );

  // The forms also call onSaved synchronously after their PATCH succeeds; we
  // still wire it for the single-section flow so the close happens promptly
  // even if onStateChange ordering varies. (Wizard mode handles advance via
  // the state change indicator timer; onSaved is a no-op there.)
  const handleSaved = useCallback(() => {
    if (wizardActive) return;
    // Single-section: onStateChange already schedules close after the indicator
    // window. Don't double-fire.
  }, [wizardActive]);

  const body = useMemo(() => {
    if (!section) return null;
    if (section === "mortgage") {
      return (
        <MortgageForm
          key={formKey}
          {...subformProps}
          initial={initial.mortgage}
          onSaved={handleSaved}
        />
      );
    }
    if (section === "investment-details") {
      return (
        <InvestmentDetailsForm
          key={formKey}
          {...subformProps}
          initial={initial.investmentDetails}
          onSaved={handleSaved}
        />
      );
    }
    if (section === "property-facts") {
      return (
        <PropertyFactsForm
          key={formKey}
          {...subformProps}
          initial={initial.propertyFacts}
          onSaved={handleSaved}
        />
      );
    }
    if (section === "financial-inputs") {
      return (
        <FinancialInputsForm
          key={formKey}
          {...subformProps}
          initial={initial.financialInputs}
          onSaved={handleSaved}
        />
      );
    }
    return (
      <RentForm
        key={formKey}
        {...subformProps}
        initial={initial.rent}
        onSaved={handleSaved}
      />
    );
  }, [section, formKey, subformProps, initial, handleSaved]);

  // ─── Wizard header (progress + unlock preview) ───────────────────────────
  const wizardHeader =
    wizardActive && section && isWizardSection(section) ? (
      <div className="mb-5 space-y-4">
        <div
          className="rounded-md border bg-subtle/60 px-3 py-2.5 text-sm text-muted"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {WIZARD_UNLOCKS[section]}
        </div>
      </div>
    ) : null;

  // ─── Footer ──────────────────────────────────────────────────────────────
  const indicatorNode = (
    <div className="text-xs text-muted" aria-live="polite">
      {indicator === "saving"
        ? "Saving…"
        : indicator === "saved"
        ? "Saved ✓"
        : subformState.error
        ? <span className="text-negative">{subformState.error}</span>
        : null}
    </div>
  );

  const wizardFooter = wizardActive ? (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {indicatorNode}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSkip}
          disabled={subformState.saving}
          className="inline-flex min-h-[40px] items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
        >
          Skip for now
        </button>
        {!isLastStep && (
          <button
            type="submit"
            form={WIZARD_FORM_ID}
            onClick={() => setIntent("close")}
            disabled={subformState.saving}
            className="inline-flex min-h-[40px] items-center rounded-md border border-border bg-transparent px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-50"
          >
            Save &amp; close
          </button>
        )}
        <button
          type="submit"
          form={WIZARD_FORM_ID}
          onClick={() => setIntent(isLastStep ? "close" : "continue")}
          disabled={subformState.saving}
          className="inline-flex min-h-[40px] items-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {subformState.saving
            ? "Saving…"
            : isLastStep
            ? "Finish & close"
            : "Save & continue"}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      subtitle={subtitle}
      footer={wizardFooter}
    >
      <div className="pb-2">
        {wizardHeader}
        {body}
      </div>
    </Drawer>
  );
}
