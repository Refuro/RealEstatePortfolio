import { AboutFounderMeta } from "@/components/about/about-founder-meta";
import { AboutPortraitPicker } from "@/components/about/about-portrait-picker";
import {
  ABOUT_PORTRAIT_ALT,
  ABOUT_PORTRAIT_INDEX,
  ABOUT_PORTRAIT_OPTIONS,
} from "@/lib/about-content";

export function AboutProfileSidebar() {
  return (
    <aside
      className="flex min-w-0 flex-col items-center gap-4 md:w-[260px] md:shrink-0 md:items-stretch md:sticky md:top-20 md:self-start"
      aria-label="Christian Spencer profile"
    >
      <AboutPortraitPicker
        initialIndex={ABOUT_PORTRAIT_INDEX}
        options={ABOUT_PORTRAIT_OPTIONS}
        alt={ABOUT_PORTRAIT_ALT}
      />
      <AboutFounderMeta />
    </aside>
  );
}
