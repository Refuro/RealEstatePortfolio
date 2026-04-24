"use client";

import Image from "next/image";
import { useState } from "react";
import type { AboutPortraitId, AboutPortraitOption } from "@/lib/about-content";

type Props = {
  initialIndex: AboutPortraitId;
  options: readonly AboutPortraitOption[];
  alt: string;
};

const MAIN_FRAME_CLASS =
  "relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm [border-top:2px_solid_color-mix(in_srgb,var(--accent)_30%,transparent)] md:mx-0 md:max-w-full";

export function AboutPortraitPicker({ initialIndex, options, alt }: Props) {
  const [activeId, setActiveId] = useState<AboutPortraitId>(initialIndex);
  const [userPicked, setUserPicked] = useState(false);

  const active = options.find((o) => o.id === activeId) ?? options[0];
  const mainPriority = !userPicked && activeId === initialIndex;

  return (
    <div className="flex flex-col gap-3">
      <div className={MAIN_FRAME_CLASS}>
        <Image
          key={active.src}
          src={active.src}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes="(max-width: 767px) 100vw, 260px"
          priority={mainPriority}
        />
      </div>
      <div
        className="flex flex-wrap items-center justify-center gap-2 md:justify-center"
        role="tablist"
        aria-label="Choose portrait photo"
      >
        {options.map((opt) => {
          const selected = opt.id === activeId;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={opt.shortLabel}
              onClick={() => {
                setUserPicked(true);
                setActiveId(opt.id);
              }}
              className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-border bg-card p-1.5 shadow-sm transition-all duration-150 hover:border-accent/30 ${
                selected
                  ? "ring-2 ring-accent/40 ring-offset-2 ring-offset-background"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <span className="relative block h-16 w-12 overflow-hidden rounded-md bg-subtle">
                <Image
                  src={opt.src}
                  alt=""
                  width={96}
                  height={120}
                  className="size-full object-cover object-top"
                  sizes="72px"
                  loading={opt.id === initialIndex ? "eager" : "lazy"}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
