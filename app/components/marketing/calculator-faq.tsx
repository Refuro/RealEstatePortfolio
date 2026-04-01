import type { CalculatorFaqItem } from "@/lib/marketing/calculator-faqs";

function buildFaqJsonLd(items: CalculatorFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function CalculatorFaqJsonLd({ items }: { items: CalculatorFaqItem[] }) {
  const payload = buildFaqJsonLd(items);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

/** Visible FAQ matching `CalculatorFaqJsonLd` (same `items` array). */
export function CalculatorFaqSection({
  items,
  heading = "Frequently asked questions",
}: {
  items: CalculatorFaqItem[];
  heading?: string;
}) {
  return (
    <section
      className="mt-10 border-t border-border/80 pt-10"
      aria-labelledby="calculator-faq-heading"
    >
      <h2
        id="calculator-faq-heading"
        className="text-center text-lg font-semibold text-foreground"
      >
        {heading}
      </h2>
      <dl className="mx-auto mt-6 max-w-2xl space-y-6">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-medium text-foreground">{item.question}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
