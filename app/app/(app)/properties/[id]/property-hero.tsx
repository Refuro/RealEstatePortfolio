"use client";

export type PropertyHeroProps = {
  nickname: string | null;
  address: string;
};

/**
 * Secondary address line when the page H1 uses a nickname; omitted when the H1 is already the address.
 */
export function PropertyHero({ nickname, address }: PropertyHeroProps) {
  if (!nickname?.trim()) {
    return null;
  }
  return (
    <div className="rounded-lg border border-border bg-subtle p-4">
      <p className="text-sm text-muted">{address}</p>
    </div>
  );
}
