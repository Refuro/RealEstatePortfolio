import { getAppOrigin } from "@/lib/app-url";

export type DefinedTermPayload = {
  /** Short canonical name (e.g. "DSCR"). */
  name: string;
  /** Expanded form (e.g. "Debt Service Coverage Ratio"). */
  alternateName?: string;
  /** One or two sentence definition. Used by LLM search engines when citing the term. */
  description: string;
  /** Canonical URL path where the term is defined. */
  path: string;
};

/**
 * Emits schema.org DefinedTerm JSON-LD on metric explainer articles so LLM-powered
 * search (Google AI Overviews, Perplexity, ChatGPT search) can surface structured
 * definitions when citing the term. All emitted terms share one DefinedTermSet
 * pointing back to /resources as the glossary hub.
 */
export function DefinedTermJsonLd({ term }: { term: DefinedTermPayload }) {
  const origin = getAppOrigin();
  const payload = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.name,
    ...(term.alternateName ? { alternateName: term.alternateName } : {}),
    description: term.description,
    url: `${origin}${term.path}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Veld Portfolio Investor Glossary",
      url: `${origin}/resources`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
