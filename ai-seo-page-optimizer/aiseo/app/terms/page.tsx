import type { Metadata } from "next";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Terms of Service</h1>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/70">
        <p>
          By using {siteConfig.productName}, you agree to submit only URLs you have the right to analyze,
          and not to use the analysis tool to access, scrape, or attack systems you do not own or have
          permission to test.
        </p>
        <p>
          Reports and scores produced by this tool are heuristic recommendations, not guarantees of search
          ranking, traffic, or inclusion in any AI-generated answer.
        </p>
        <p>This page is a placeholder. Replace it with your actual terms of service before taking the product live.</p>
      </div>
    </div>
  );
}
