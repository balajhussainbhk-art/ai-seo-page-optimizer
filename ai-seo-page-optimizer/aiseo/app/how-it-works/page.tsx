import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "How It Works",
  description: `How ${siteConfig.productName} analyzes a webpage for SEO and AI Search readiness, step by step.`,
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    title: "1. Paste a public URL",
    body: "Enter any publicly accessible webpage — a product page, blog post, service page, or local business page. No login-protected pages.",
  },
  {
    title: "2. The page is fetched securely",
    body: "The page is fetched server-side with safety checks in place: no private networks, no internal IPs, reasonable size and timeout limits.",
  },
  {
    title: "3. SEO and content signals are extracted",
    body: "Title, meta description, canonical, headings, paragraphs, images, links, and structured data (JSON-LD) are parsed from the page.",
  },
  {
    title: "4. Technical SEO and heading structure are scored",
    body: "Each signal is checked against widely-accepted, people-first SEO practices — not gamed tricks like keyword stuffing.",
  },
  {
    title: "5. AI Search readiness is evaluated",
    body: "The page's content is checked against likely user questions, entity coverage, and how easy it is to extract clear answers from.",
  },
  {
    title: "6. You get a prioritized fix list",
    body: "Every finding includes why it matters and exactly what to change, ranked from highest to lowest impact.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <h1 className="max-w-2xl font-display text-4xl text-ink">How it works</h1>
      <p className="mt-4 max-w-xl text-lg text-ink/60">
        A page-level SEO and AI Search audit, from URL to recommendations, in under a minute.
      </p>

      <div className="mt-12 max-w-2xl divide-y divide-line border-t border-line">
        {steps.map((step) => (
          <div key={step.title} className="py-6">
            <h2 className="text-[15px] font-medium text-ink">{step.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <ButtonLink href="/#analyze" variant="signal" size="lg">
          Analyze a page now
        </ButtonLink>
      </div>
    </div>
  );
}
