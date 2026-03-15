"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

function useModalFocus(open: boolean, onClose: () => void, containerRef: React.RefObject<HTMLDivElement | null>) {
  const previousActiveRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement;
    const firstFocusable = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [open, containerRef]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        (previousActiveRef.current as HTMLElement)?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (previousActiveRef.current as HTMLElement)?.focus();
    };
  }, [open, onClose]);
}
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "add-property-wizard-draft";

export type WizardData = {
  nickname: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  units: string;
  ownershipPercent: string;
  purchasePrice: string;
  purchaseDate: string;
  currentEstimatedValue: string;
  cashInvested: string;
  currentMonthlyRent: string;
  unitRents: string[];
  currentMonthlyExpenses: string;
  notes: string;
  bedrooms: string;
  bathrooms: string;
  addMortgage: boolean | null;
  mortgage: Record<string, unknown>;
};

export type DraftPayload = {
  data: WizardData;
  savedAt: string;
};

export function hasAnyWizardData(data: {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  purchasePrice?: string;
  purchaseDate?: string;
  currentEstimatedValue?: string;
  cashInvested?: string;
  currentMonthlyRent?: string;
  unitRents?: string[];
  currentMonthlyExpenses?: string;
  mortgage?: Record<string, unknown>;
}): boolean {
  const has = (s: string | undefined) => s != null && String(s).trim() !== "";
  const hasNum = (s: string | undefined) => {
    const n = Number(s);
    return !Number.isNaN(n) && n > 0;
  };
  if (has(data.addressLine1) || has(data.addressLine2) || has(data.city) || has(data.state) || has(data.zipCode))
    return true;
  if (hasNum(data.purchasePrice) || has(data.purchaseDate) || hasNum(data.currentEstimatedValue) || hasNum(data.cashInvested))
    return true;
  if (hasNum(data.currentMonthlyRent) || (Array.isArray(data.unitRents) && data.unitRents.some((r) => hasNum(r))) || hasNum(data.currentMonthlyExpenses))
    return true;
  const m = data.mortgage;
  if (m && typeof m === "object") {
    if (hasNum(m.currentBalance as string) || hasNum(m.monthlyPayment as string) || has(m.interestRatePercent as string))
      return true;
  }
  return false;
}

function loadDraft(): DraftPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftPayload;
    if (parsed?.data && parsed?.savedAt) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveDraftToStorage(payload: DraftPayload): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function clearDraftFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

type DraftContextValue = {
  hasDraft: boolean;
  draftData: DraftPayload | null;
  savedAt: string | null;
  setHasDraft: (v: boolean) => void;
  saveDraft: (data: WizardData) => void;
  clearDraft: () => void;
  navigateTo: (href: string) => void;
  registerWizardGetData: (getData: (() => WizardData) | null) => void;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function useDraft() {
  const ctx = useContext(DraftContext);
  return ctx;
}

type LeaveModalAction = "save" | "discard" | "cancel";

export function DraftProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasDraft, setHasDraftState] = useState(false);
  const [draftData, setDraftData] = useState<DraftPayload | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [leaveModal, setLeaveModal] = useState<{ href: string } | null>(null);
  const [restoreModal, setRestoreModal] = useState<DraftPayload | null>(null);
  const wizardGetDataRef = useRef<(() => WizardData) | null>(null);
  const leaveModalRef = useRef<HTMLDivElement>(null);
  const restoreModalRef = useRef<HTMLDivElement>(null);

  useModalFocus(!!leaveModal, () => setLeaveModal(null), leaveModalRef);
  useModalFocus(!!restoreModal, () => setRestoreModal(null), restoreModalRef);

  const setHasDraft = useCallback((v: boolean) => {
    setHasDraftState(v);
  }, []);

  const saveDraft = useCallback((data: WizardData) => {
    const payload: DraftPayload = {
      data,
      savedAt: new Date().toISOString(),
    };
    saveDraftToStorage(payload);
    setDraftData(payload);
    setSavedAt(payload.savedAt);
    setHasDraftState(true);
  }, []);

  const clearDraft = useCallback(() => {
    clearDraftFromStorage();
    setDraftData(null);
    setSavedAt(null);
    setHasDraftState(false);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      const onWizard = pathname === "/properties/new";
      if (onWizard && hasDraft) {
        setLeaveModal({ href });
      } else {
        router.push(href);
      }
    },
    [pathname, hasDraft, router]
  );

  const handleLeaveModalAction = useCallback(
    (action: LeaveModalAction) => {
      const href = leaveModal?.href;
      setLeaveModal(null);
      if (!href) return;
      if (action === "cancel") return;
      if (action === "discard") clearDraft();
      if (action === "save") {
        const currentData = wizardGetDataRef.current?.();
        if (currentData) {
          const payload: DraftPayload = {
            data: currentData,
            savedAt: new Date().toISOString(),
          };
          saveDraftToStorage(payload);
          setDraftData(payload);
          setSavedAt(payload.savedAt);
          setHasDraftState(true);
        } else if (draftData) {
          saveDraftToStorage(draftData);
        }
      } else if (action === "discard") {
        clearDraftFromStorage();
      }
      router.push(href);
    },
    [leaveModal, draftData, router, clearDraft]
  );

  const handleRestoreChoice = useCallback(
    (continueWithDraft: boolean) => {
      if (continueWithDraft && restoreModal) {
        setDraftData(restoreModal);
        setSavedAt(restoreModal.savedAt);
        setHasDraftState(true);
      } else {
        clearDraftFromStorage();
      }
      setRestoreModal(null);
    },
    [restoreModal]
  );

  useEffect(() => {
    if (pathname === "/properties/new") {
      const loaded = loadDraft();
      if (loaded && hasAnyWizardData(loaded.data)) {
        const id = setTimeout(() => {
          setDraftData(null); // Don't restore until user clicks Continue
          setRestoreModal(loaded);
        }, 0);
        return () => clearTimeout(id);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pathname === "/properties/new" && hasDraft) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pathname, hasDraft]);

  const registerWizardGetData = useCallback((getData: (() => WizardData) | null) => {
    wizardGetDataRef.current = getData;
  }, []);

  const value: DraftContextValue = {
    hasDraft,
    draftData,
    savedAt,
    setHasDraft,
    saveDraft,
    clearDraft,
    navigateTo,
    registerWizardGetData,
  };

  return (
    <DraftContext.Provider value={value}>
      {children}
      {leaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-modal-title"
        >
          <div
            ref={leaveModalRef}
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <h2 id="leave-modal-title" className="text-lg font-semibold text-foreground">
              Unsaved changes
            </h2>
            <p className="mt-2 text-sm text-muted">
              You have unsaved data in the add property wizard. What would you like to do?
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleLeaveModalAction("cancel")}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLeaveModalAction("discard")}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
              >
                Don&apos;t save and continue
              </button>
              <button
                type="button"
                onClick={() => handleLeaveModalAction("save")}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Save draft and continue
              </button>
            </div>
          </div>
        </div>
      )}
      {restoreModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restore-modal-title"
        >
          <div
            ref={restoreModalRef}
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <h2 id="restore-modal-title" className="text-lg font-semibold text-foreground">
              Continue from draft?
            </h2>
            <p className="mt-2 text-sm text-muted">
              You have a saved draft from{" "}
              {new Date(restoreModal.savedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              . Would you like to continue or start fresh?
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleRestoreChoice(false)}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
              >
                Start fresh
              </button>
              <button
                type="button"
                onClick={() => handleRestoreChoice(true)}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Continue from draft
              </button>
            </div>
          </div>
        </div>
      )}
    </DraftContext.Provider>
  );
}
