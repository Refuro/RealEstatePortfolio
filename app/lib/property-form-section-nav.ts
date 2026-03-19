/**
 * Anchor IDs aligned with add-property flow (Epic C) + edit-only notes.
 * Use with sticky “Jump to” nav on `/properties/[id]/edit`.
 */
export const PROPERTY_EDIT_SECTION_NAV = [
  { id: "section-location", label: "Location & profile" },
  { id: "section-economics", label: "Purchase & value" },
  { id: "section-income", label: "Income & expenses" },
  { id: "section-notes", label: "Notes" },
] as const;
