"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";

/**
 * Identifies the Clerk user in PostHog; resets on sign-out.
 */
export function PostHogIdentify(): null {
  const { user, isLoaded } = useUser();
  const previousId = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!isLoaded) return;

    if (user?.id) {
      if (previousId.current !== user.id) {
        previousId.current = user.id;
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress ?? undefined,
        });
      }
    } else {
      if (previousId.current !== null) {
        previousId.current = null;
        posthog.reset();
      }
    }
  }, [isLoaded, user]);

  return null;
}
