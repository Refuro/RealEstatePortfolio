export type SubformState = {
  saving: boolean;
  saved: boolean;
  error: string | null;
};

export const initialSubformState: SubformState = {
  saving: false,
  saved: false,
  error: null,
};

export type SubformBaseProps = {
  /** Called when the subform's saving/saved/error state changes. */
  onStateChange?: (state: SubformState) => void;
  /** Called after a successful save. */
  onSaved?: () => void;
  /** Called when the user clicks Cancel (only relevant when actions visible). */
  onCancel?: () => void;
  /** Hide the built-in Save / Cancel footer (consumer renders its own). */
  hideActions?: boolean;
  /** Optional class for the form root. */
  className?: string;
  /**
   * When set, the inner `<form>` element receives this id so an external
   * submit button (`<button type="submit" form={formId}>`) can drive submission.
   * Required for the wizard drawer footer to invoke the form's save logic.
   */
  formId?: string;
};
