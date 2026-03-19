"use client";

export type PropertyHeroProps = {
  nickname: string | null;
  address: string;
};

/**
 * Identity strip for the property Overview tab. KPIs live in “Performance at a glance” below.
 */
export function PropertyHero({ nickname, address }: PropertyHeroProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {nickname || address || "Property"}
          </h2>
          {address && nickname && (
            <p className="mt-0.5 text-sm text-muted">{address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
