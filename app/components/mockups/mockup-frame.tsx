"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

type MockupFrameProps = {
  children: ReactNode;
  /** The pixel width the mockup content is designed at. */
  internalWidth?: number;
  /** If true, scales to fit both width and explicit container height. */
  fitToHeight?: boolean;
  /** Show browser-style chrome dots at the top. */
  chrome?: boolean;
  /** Optional faux address bar (only when `chrome` is true). */
  chromeUrl?: string;
  className?: string;
  ariaLabel: string;
};

/**
 * Renders children at a fixed internal width, then CSS-scales them to fit
 * the container. Text is always rendered at the internal resolution by the
 * browser, so it stays crisp regardless of display size or DPR.
 */
export function MockupFrame({
  children,
  internalWidth = 960,
  fitToHeight = false,
  chrome = false,
  chromeUrl,
  className = "",
  ariaLabel,
}: MockupFrameProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [outerHeight, setOuterHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const content = contentRef.current;
    if (!outer || !content) return;

    const measure = () => {
      const nextContentHeight = content.scrollHeight;
      const widthScale = Math.min(outer.clientWidth / internalWidth, 1);
      const nextOuterHeight = outer.clientHeight;
      const heightScale =
        fitToHeight && nextOuterHeight > 0 && nextContentHeight > 0
          ? nextOuterHeight / nextContentHeight
          : 1;
      const s = Math.min(widthScale, heightScale, 1);
      setOuterHeight(nextOuterHeight);
      setScale(s);
      setContentHeight(nextContentHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [fitToHeight, internalWidth]);

  return (
    <div
      ref={outerRef}
      className={`overflow-hidden ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      {chrome && (
        <div className="flex items-center gap-2 border-b border-border bg-subtle px-3 py-2">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-red-400/65" />
            <span className="size-2.5 rounded-full bg-amber-300/65" />
            <span className="size-2.5 rounded-full bg-green-400/65" />
          </div>
          {chromeUrl ? (
            <div className="flex min-w-0 flex-1 justify-center px-1">
              <div className="flex h-[18px] w-full max-w-[200px] items-center justify-center rounded bg-border px-2">
                <span className="truncate font-mono text-[9.5px] text-muted-foreground">
                  {chromeUrl}
                </span>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1" aria-hidden />
          )}
        </div>
      )}
      <div
        className={`relative bg-background ${
          scale === 0 && !fitToHeight ? "min-h-[min(28rem,65vh)]" : ""
        }`}
        style={{
          height:
            scale > 0
              ? fitToHeight && outerHeight > 0
                ? outerHeight
                : contentHeight * scale
              : undefined,
        }}
      >
        <div
          ref={contentRef}
          className="pointer-events-none absolute left-0 top-0 origin-top-left select-none"
          aria-hidden="true"
          style={{
            width: internalWidth,
            transform: scale > 0 ? `scale(${scale})` : undefined,
            opacity: scale > 0 ? 1 : 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
