"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format-currency";

const MINUS = "−";

const SVG_W = 800;
const SVG_H = 200;
const CHART_TOP = 12;
const CHART_BOTTOM = 170;
const CHART_H = CHART_BOTTOM - CHART_TOP; // 158

type EquityTrendChartProps = {
  equitySeries: number[];
  monthLabels: string[];
  equityDeltaSinceFirst: number | null;
};

function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return formatCurrency(n);
}

function toSvgPoints(series: number[]): { x: number; y: number }[] {
  if (series.length < 2) return [];
  const minVal = Math.min(...series);
  const maxVal = Math.max(...series);
  const range = maxVal - minVal || 1;
  return series.map((val, i) => ({
    x: (i / (series.length - 1)) * SVG_W,
    y: CHART_TOP + ((maxVal - val) / range) * CHART_H,
  }));
}

function buildLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return [`M${first!.x},${first!.y}`, ...rest.map((p) => `L${p.x},${p.y}`)].join(" ");
}

function buildFillPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const last = points[points.length - 1]!;
  const first = points[0]!;
  return `${buildLinePath(points)} L${last.x},${CHART_BOTTOM} L${first.x},${CHART_BOTTOM} Z`;
}

function yAxisLabels(series: number[]): { y: number; textY: number; value: string }[] {
  const minVal = Math.min(...series);
  const maxVal = Math.max(...series);
  const range = maxVal - minVal;
  const gridYs = [CHART_BOTTOM, 125, 80, 35];
  return gridYs.map((gy) => {
    const fraction = (CHART_BOTTOM - gy) / CHART_H;
    const value = minVal + fraction * range;
    return { y: gy, textY: gy + 3, value: fmtCompact(value) };
  });
}

export function EquityTrendChart({
  equitySeries,
  monthLabels,
  equityDeltaSinceFirst,
}: EquityTrendChartProps) {
  const hasData = equitySeries.length >= 2;
  const points = hasData ? toSvgPoints(equitySeries) : [];
  const linePath = buildLinePath(points);
  const fillPath = buildFillPath(points);
  const lastPoint = points[points.length - 1];
  const yLabels = hasData ? yAxisLabels(equitySeries) : [];

  const deltaPositive = (equityDeltaSinceFirst ?? 0) >= 0;
  const deltaSigned =
    equityDeltaSinceFirst != null
      ? `${equityDeltaSinceFirst >= 0 ? "+" : MINUS}${formatCurrency(Math.abs(equityDeltaSinceFirst))} since first snapshot`
      : null;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  function resolveIdx(e: React.MouseEvent<SVGRectElement>): number {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * SVG_W;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i]!.x - svgX);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  function handleMouseMove(e: React.MouseEvent<SVGRectElement>) {
    if (points.length === 0) return;
    setHoverIdx(resolveIdx(e));
  }

  function handleMouseLeave() {
    setHoverIdx(null);
  }

  function handleClick(e: React.MouseEvent<SVGRectElement>) {
    if (points.length === 0) return;
    const idx = resolveIdx(e);
    setHoverIdx((prev) => (prev === idx ? null : idx));
  }

  function handleTouchStart(e: React.TouchEvent<SVGRectElement>) {
    if (points.length === 0 || e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0]!;
    const svgX = ((touch.clientX - rect.left) / rect.width) * SVG_W;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i]!.x - svgX);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setHoverIdx(best);
  }

  const hoverPoint = hoverIdx != null ? points[hoverIdx] : null;
  const hoverValue = hoverIdx != null ? equitySeries[hoverIdx] ?? null : null;
  const hoverLabel = hoverIdx != null ? monthLabels[hoverIdx] ?? null : null;
  const hoverDelta =
    hoverIdx != null && hoverIdx > 0
      ? (equitySeries[hoverIdx] ?? 0) - (equitySeries[hoverIdx - 1] ?? 0)
      : null;
  const tooltipXPct = hoverPoint != null ? (hoverPoint.x / SVG_W) * 100 : 0;
  const tooltipLeft = tooltipXPct < 65;

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--card)", borderColor: "var(--border)", padding: "20px 22px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
            Portfolio equity trend
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--foreground-muted)", marginTop: "2px" }}>
            Snapshot-based view of how your equity has changed over time
          </div>
        </div>

        {deltaSigned && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "6px",
              background: deltaPositive ? "var(--positive-dim)" : "var(--negative-dim)",
              color: deltaPositive ? "var(--positive)" : "var(--negative)",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              {deltaPositive ? (
                <path
                  d="M1 9l3.5-4L7 7l4-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M1 3l3.5 4L7 5l4 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            {deltaSigned}
          </div>
        )}
      </div>

      {/* SVG chart */}
      <div style={{ width: "100%", overflow: "hidden", position: "relative" }}>
        {hasData ? (
          <>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="none"
              style={{ width: "100%", height: "200px", display: "block" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="equity-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Baseline */}
              <line
                x1="0"
                y1={CHART_BOTTOM}
                x2={SVG_W}
                y2={CHART_BOTTOM}
                stroke="var(--border)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />

              {/* Dashed gridlines */}
              {[125, 80, 35].map((gy) => (
                <line
                  key={gy}
                  x1="0"
                  y1={gy}
                  x2={SVG_W}
                  y2={gy}
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {/* Y-axis labels */}
              {yLabels.map(({ y, textY, value }) => (
                <text
                  key={y}
                  x="4"
                  y={textY}
                  fontSize="9"
                  fill="var(--fg-dimmer)"
                  fontFamily="ui-monospace, monospace"
                >
                  {value}
                </text>
              ))}

              {/* Gradient fill */}
              <path d={fillPath} fill="url(#equity-gradient)" />

              {/* Trend line */}
              <path
                d={linePath}
                fill="none"
                stroke="var(--positive)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              {/* Hover guide line */}
              {hoverPoint && (
                <line
                  x1={hoverPoint.x}
                  y1={CHART_TOP}
                  x2={hoverPoint.x}
                  y2={CHART_BOTTOM}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Transparent overlay — captures mouse/touch events.
                  pointerEvents="all" makes the transparent fill reliably clickable. */}
              <rect
                x="0"
                y="0"
                width={SVG_W}
                height={SVG_H}
                fill="transparent"
                pointerEvents="all"
                style={{ cursor: "crosshair" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchStart}
              />
            </svg>

            {/* Circles rendered as HTML overlays so they stay round under
                preserveAspectRatio="none" (SVG circles would distort to ovals). */}
            {lastPoint && !hoverPoint && (
              <div
                style={{
                  position: "absolute",
                  left: `${(lastPoint.x / SVG_W) * 100}%`,
                  top: `${lastPoint.y}px`,
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--positive)",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            )}
            {hoverPoint && (
              <div
                style={{
                  position: "absolute",
                  left: `${(hoverPoint.x / SVG_W) * 100}%`,
                  top: `${hoverPoint.y}px`,
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "var(--positive)",
                  border: "2px solid var(--card)",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  boxSizing: "content-box",
                }}
              />
            )}

            {/* Tooltip */}
            {hoverIdx != null && hoverLabel != null && hoverValue != null && (
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  ...(tooltipLeft
                    ? { left: `calc(${tooltipXPct}% + 10px)` }
                    : { right: `calc(${100 - tooltipXPct}% + 10px)` }),
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontSize: "11.5px",
                  color: "var(--foreground)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{hoverLabel}</div>
                <div style={{ color: "var(--foreground-muted)" }}>{fmtCompact(hoverValue)}</div>
                {hoverDelta !== null && (
                  <div
                    style={{
                      color: hoverDelta >= 0 ? "var(--positive)" : "var(--negative)",
                      fontWeight: 500,
                    }}
                  >
                    {hoverDelta >= 0 ? "+" : MINUS}
                    {fmtCompact(Math.abs(hoverDelta))} vs prev
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--foreground-muted)",
              fontSize: "12px",
            }}
          >
            Add snapshots to track equity over time
          </div>
        )}
      </div>

      {/* X-axis month labels */}
      {monthLabels.length >= 2 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            fontSize: "10px",
            color: "var(--fg-dimmer)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {monthLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
