"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildConsentCookieHeader,
  type CookieConsentStored,
  COOKIE_CONSENT_NAME,
  parseConsentCookieValue,
} from "@/lib/cookie-consent";

type ConsentState = CookieConsentStored | null;

type CookieConsentContextValue = {
  consent: ConsentState;
  ready: boolean;
  hasAnalyticsConsent: boolean;
  acceptAnalytics: () => void;
  rejectOptional: () => void;
  openPreferences: () => void;
  preferencesOpen: boolean;
  closePreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

function readBrowserConsent(): ConsentState {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_CONSENT_NAME}=([^;]*)`)
  );
  if (!m?.[1]) return null;
  return parseConsentCookieValue(decodeURIComponent(m[1]));
}

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setConsent(readBrowserConsent());
      setReady(true);
    });
  }, []);

  const persist = useCallback((value: CookieConsentStored) => {
    document.cookie = buildConsentCookieHeader(value);
    setConsent(value);
    setPreferencesOpen(false);
  }, []);

  const acceptAnalytics = useCallback(() => persist("analytics"), [persist]);
  const rejectOptional = useCallback(() => persist("essential"), [persist]);
  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo(
    () => ({
      consent,
      ready,
      hasAnalyticsConsent: consent === "analytics",
      acceptAnalytics,
      rejectOptional,
      openPreferences,
      preferencesOpen,
      closePreferences,
    }),
    [
      consent,
      ready,
      acceptAnalytics,
      rejectOptional,
      openPreferences,
      closePreferences,
      preferencesOpen,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}
