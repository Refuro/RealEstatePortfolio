"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function setUserDataWhenReady(hashedEmail: string, attempt = 0): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("set", "user_data", { email_address: hashedEmail });
    return;
  }
  if (attempt < 30) {
    setTimeout(() => setUserDataWhenReady(hashedEmail, attempt + 1), 100);
  }
}

/**
 * Sets hashed user email on gtag for Google Ads enhanced conversions.
 * Must be called before any conversion events fire so Google can match
 * the conversion to a Google account holder.
 *
 * Uses SHA-256 hashing via the Web Crypto API (no external dependency).
 * Safe to mount at the root layout level — does nothing if gtag isn't loaded
 * (no consent) or if no user is signed in.
 */
export function GoogleAdsUserData(): null {
  const { user, isLoaded } = useUser();
  const set = useRef(false);

  useEffect(() => {
    if (!isLoaded || set.current) return;
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    set.current = true;
    void hashEmail(email).then((hashed) => setUserDataWhenReady(hashed));
  }, [isLoaded, user]);

  return null;
}
