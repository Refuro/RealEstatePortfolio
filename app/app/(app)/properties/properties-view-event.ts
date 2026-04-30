// Shared client-side event so the toggle in the toolbar can drive the actual
// view state held in `PropertiesCardGrid` without a server roundtrip.
export const PROPERTIES_VIEW_EVENT = "veld:properties-view";

export type PropertiesViewEventDetail = { view: "grid" | "list" };

export function dispatchPropertiesViewEvent(view: "grid" | "list") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PropertiesViewEventDetail>(PROPERTIES_VIEW_EVENT, {
      detail: { view },
    })
  );
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.history.replaceState({}, "", url.toString());
  } catch {
    // no-op in environments where history is unavailable
  }
}
