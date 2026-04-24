import { Linkedin, Twitter } from "lucide-react";
import {
  ABOUT_PORTRAIT_BYLINE,
  ABOUT_PORTRAIT_NAME,
  ABOUT_SOCIAL_LINKS,
  type AboutSocialKind,
} from "@/lib/about-content";

const SOCIAL_ICONS: Record<AboutSocialKind, typeof Linkedin> = {
  linkedin: Linkedin,
  x: Twitter,
};

export function AboutFounderMeta() {
  return (
    <div className="min-w-0 space-y-3 text-center">
      <div>
        <p className="text-sm font-semibold text-foreground">{ABOUT_PORTRAIT_NAME}</p>
        <p className="mt-0.5 text-xs text-muted">{ABOUT_PORTRAIT_BYLINE}</p>
      </div>
      {ABOUT_SOCIAL_LINKS.length > 0 ? (
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {ABOUT_SOCIAL_LINKS.map(({ href, label, kind }) => {
            const Icon = SOCIAL_ICONS[kind];
            return (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-card text-muted shadow-sm transition-all duration-150 hover:border-accent/30 hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
