const steps = [
  {
    title: "Paste a URL",
    description:
      "Drop in any public webpage — a product page, article, service page, or local business listing.",
  },
  {
    title: "We analyze the page",
    description:
      "The page is fetched and checked for technical SEO signals, content depth, heading structure, structured data, and AI Search readiness.",
  },
  {
    title: "Get a prioritized fix list",
    description:
      "Every finding comes with why it matters and exactly what to change — ranked so you know what to fix first.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-b border-line bg-white">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-display text-3xl text-ink">How it works</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title}>
              <span className="font-mono text-sm text-ink/35">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
