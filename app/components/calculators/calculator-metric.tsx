import {
  calculatorToneCardClass,
  calculatorToneValueClass,
  type CalculatorMetricTone,
} from "@/lib/calculator-metric-tones";

export function CalculatorMetric({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: CalculatorMetricTone;
}) {
  const accent = calculatorToneCardClass[tone];
  return (
    <div
      className={`rounded-md border border-border/70 bg-background/45 px-3 py-2 ${
        accent ? `border-l-2 ${accent}` : ""
      }`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-base font-semibold ${calculatorToneValueClass[tone]}`}>{value}</p>
      {helper ? <p className="mt-0.5 text-[11px] text-muted">{helper}</p> : null}
    </div>
  );
}
