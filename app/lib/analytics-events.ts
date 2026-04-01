/** Stable PostHog event names — use everywhere (client + server docs). */
export const AnalyticsEvents = {
  USER_SIGNED_UP: "user_signed_up",
  PROPERTY_CREATED: "property_created",
  DEAL_CREATED: "deal_created",
  CHECKOUT_STARTED: "checkout_started",
  BILLING_PORTAL_OPENED: "billing_portal_opened",
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
  // --- Batch 10 funnel (new names are snake_case) ---
  FUNNEL_CTA_CLICKED: "funnel_cta_clicked",
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  ADD_PROPERTY_MILESTONE_REACHED: "add_property_milestone_reached",
  PLAN_INTENT_APPLIED: "plan_intent_applied",
  SUBSCRIPTION_UPDATED: "subscription_updated",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
  PLAN_LIMIT_HIT: "plan_limit_hit",
  PLAN_LIMIT_UPGRADE_CTA_CLICKED: "plan_limit_upgrade_cta_clicked",
  IMPORT_COMPLETED: "import_completed",
  IMPORT_FAILED: "import_failed",
} as const;
