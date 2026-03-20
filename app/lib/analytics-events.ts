/** Stable PostHog event names — use everywhere (client + server docs). */
export const AnalyticsEvents = {
  USER_SIGNED_UP: "user_signed_up",
  PROPERTY_CREATED: "property_created",
  DEAL_CREATED: "deal_created",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
} as const;
