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

  const visibleCount = [
    showIncomplete,
    showCashFlowNegative,
    showCashFlowPositive,
    showRefiReady,
  ].filter(Boolean).length;
  if (visibleCount === 0) return null;

  // A lone card in a 3-col grid leaves an awkward 2/3 gap, so stretch any
  // single visible card to full width. With 2+ cards, keep the 3-col grid and
  // let the incomplete card span 2 cols when it shares the row.
  const isSingleCard = visibleCount === 1;
  const incompleteAccompanied =
    showIncomplete &&
    (showCashFlowNegative || showCashFlowPositive || showRefiReady);

  return (
    <section
      aria-label="Tasks"
      className={`mb-6 grid grid-cols-1 gap-4 ${
        isSingleCard ? "" : "lg:grid-cols-3"
      }`}
    >
      {showIncomplete && (
        <div className={incompleteAccompanied ? "lg:col-span-2" : ""}>
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
