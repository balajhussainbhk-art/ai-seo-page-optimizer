import type { Metadata } from "next";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Features",
  description: `See everything ${siteConfig.productName} checks in a single-page SEO and AI Search audit — technical SEO, headings, structured data, content coverage, and more.`,
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <div>
      <div className="mx-auto max-w-content px-6 py-16">
        <h1 className="max-w-2xl font-display text-4xl text-ink">
          Everything you need to optimize a page for Google and AI Search
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink/60">
          One audit. Traditional SEO signals and AI Search readiness, evaluated together, with clear
          recommendations for what to fix.
        </p>
      </div>
      <FeatureGrid />
    </div>
  );
}
