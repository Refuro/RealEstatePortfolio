import {
  IncompleteProfilesCard,
  type IncompleteProfileRow,
} from "./task-center/incomplete-profiles-card";
import {
  CashFlowHealthCard,
  type CashFlowNegativeRow,
} from "./task-center/cash-flow-health-card";
import {
  RefiReadyCard,
  type RefiReadyRow,
} from "./task-center/refi-ready-card";

/**
 * Hide rules per Decision #7:
 *   - Incomplete: ≥1 property below 100
 *   - CF (red): ≥1 property cash-flow negative
 *   - CF (green): ≥1 property crossed CF negative → positive in last snapshot
 *   - Refi-ready: ≥1 property qualifies
 *   - Section hides entirely when no card has signal
 */
export type TaskCenterProps = {
  incompleteRows: IncompleteProfileRow[];
  totalIncomplete: number;
  cashFlowNegativeRows: CashFlowNegativeRow[];
  /** Set when ≥1 property crossed neg→pos in the most recent snapshot. */
  recentlyImprovedName: string | null;
  refiReadyRows: RefiReadyRow[];
};

export function TaskCenter(props: TaskCenterProps) {
  const showIncomplete = props.incompleteRows.length > 0;
  const showCashFlowNegative = props.cashFlowNegativeRows.length > 0;
  const showCashFlowPositive =
    !showCashFlowNegative && props.recentlyImprovedName != null;
  const showRefiReady = props.refiReadyRows.length > 0;

  const anyVisible =
    showIncomplete || showCashFlowNegative || showCashFlowPositive || showRefiReady;
  if (!anyVisible) return null;

  // When the incomplete card is the only visible task, drop the 3-col grid so
  // it spans full width — the lg:col-span-2 leaves a 1/3 gap that looks
  // awkward when there's nothing to fill it.
  const hasOtherCards =
    showCashFlowNegative || showCashFlowPositive || showRefiReady;

  return (
    <section
      aria-label="Tasks"
      className={`mb-6 grid grid-cols-1 gap-4 ${
        hasOtherCards ? "lg:grid-cols-3" : ""
      }`}
    >
      {showIncomplete && (
        <div className={hasOtherCards ? "lg:col-span-2" : ""}>
          <IncompleteProfilesCard
            rows={props.incompleteRows}
            totalIncomplete={props.totalIncomplete}
          />
        </div>
      )}
      {showCashFlowNegative && (
        <CashFlowHealthCard
          variant="negative"
          rows={props.cashFlowNegativeRows}
        />
      )}
      {showCashFlowPositive && (
        <CashFlowHealthCard
          variant="positive"
          recentlyImprovedName={props.recentlyImprovedName}
        />
      )}
      {showRefiReady && <RefiReadyCard rows={props.refiReadyRows} />}
    </section>
  );
}
