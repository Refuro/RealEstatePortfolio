/** Stable PostHog event names — use everywhere (client + server docs). */
export const AnalyticsEvents = {
  USER_SIGNED_UP: "user_signed_up",
  PROPERTY_CREATED: "property_created",
  DEAL_CREATED: "deal_created",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
  // --- Batch 10 funnel (new names are snake_case) ---
  FUNNEL_CTA_CLICKED: "funnel_cta_clicked",
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  ADD_PROPERTY_MILESTONE_REACHED: "add_property_milestone_reached",
  PLAN_INTENT_APPLIED: "plan_intent_applied",
} as const;
