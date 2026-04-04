"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps landing page section content with a scroll-triggered entrance animation.
 * Uses IntersectionObserver — fires once per element, then disconnects.
 * All animation classes use `motion-safe:` so users with prefers-reduced-motion
 * see a completely static layout.
 *
 * Usage: wrap the inner content div (not the <section> element itself) so
 * section background colors are never animated in/out.
 */
export function AnimatedSection({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animationClasses = [
    "motion-safe:transition-all",
    "motion-safe:duration-500",
    "motion-safe:ease-out",
    visible
      ? "motion-safe:opacity-100 motion-safe:translate-y-0"
      : "motion-safe:opacity-0 motion-safe:translate-y-3",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={animationClasses}>
      {children}
    </div>
  );
}
