/**
 * Public /about page copy. Edit here instead of JSX.
 *
 * Portraits: `public/assets/SelfPhoto.jpg`, `SelfPhoto2.jpg`, `SelfPhoto3.jpg`.
 * Keep JPEGs reasonably sized (e.g. long edge ~1200–1600px, quality ~80) so
 * the repo and image optimization stay lean.
 */

export const ABOUT_EYEBROW = "Founder";

export const ABOUT_TITLE = "Hey! My name's Christian";

export const ABOUT_LEDE =
  "I built Veld Portfolio because I was sick of all the spreadsheet chaos and wanted to see all my numbers in one place.";

/** First intro block under the hero (readable measure in layout). */
export const ABOUT_INTRO_FIRST =
  "I'm a software engineer who happens to also own a few rental properties. I've been investing in real estate for the last 6 years, and I've learned a lot while doing so. My idea to create Veld came from being a stock investor. With stocks you've got apps like Robinhood or Fidelity to see all your numbers, but with real estate I found those options lacking and decided to do something about it.";

/** Second intro block — rendered in an inset panel for visual rhythm. */
export const ABOUT_INTRO_SECOND =
  "Outside of Veld and my professional career, I have a beautiful Australian Shepherd named Eden, and have a passion for music. I play piano, guitar, and occasionally a little karaoke. Don't be afraid to reach out and ask questions!";

export const ABOUT_WHY_VELD_TITLE = "Why Veld exists";

/** Scannable bullets (factual product claims). */
export const ABOUT_WHY_VELD_BULLETS: readonly string[] = [
  "Tools were fragmented: re-entering the same property data on every site.",
  "Spreadsheets drift: formulas break and metrics disagree across tabs.",
  "Veld is one place to track what you own and underwrite what you might buy.",
];

export const ABOUT_WHY_VELD_CLOSING =
  "No rent collection, no bank sync, and no pretending to be your accountant — just portfolio analytics and deal math in one product.";

export const ABOUT_PORTRAIT_OPTIONS = [
  { id: 1 as const, src: "/assets/SelfPhoto.jpg", shortLabel: "Photo 1" },
  { id: 2 as const, src: "/assets/SelfPhoto2.jpg", shortLabel: "Photo 2" },
  { id: 3 as const, src: "/assets/SelfPhoto3.jpg", shortLabel: "Photo 3" },
] as const;

export type AboutPortraitId = (typeof ABOUT_PORTRAIT_OPTIONS)[number]["id"];

export type AboutPortraitOption = (typeof ABOUT_PORTRAIT_OPTIONS)[number];

/** Default hero + SEO portrait (`1`–`3`). Thumbnails on the About page can switch the visible image. */
export const ABOUT_PORTRAIT_INDEX = 1 as AboutPortraitId;

export const ABOUT_PORTRAIT_ALT = "Christian Spencer, founder of Veld Portfolio";

/** Shown under the portrait (name + role line). */
export const ABOUT_PORTRAIT_NAME = "Christian Spencer";

export const ABOUT_PORTRAIT_BYLINE = "Founder, Veld Portfolio";

/**
 * Optional social icons under the photo. Leave empty to hide the row.
 * Add your profile URLs when you want them public.
 */
export type AboutSocialKind = "linkedin" | "x";

export const ABOUT_SOCIAL_LINKS: readonly {
  href: string;
  label: string;
  kind: AboutSocialKind;
}[] = [];
