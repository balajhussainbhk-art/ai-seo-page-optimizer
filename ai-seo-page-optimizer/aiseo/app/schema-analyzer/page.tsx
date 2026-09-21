import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/SeoLandingTemplate";

export const metadata: Metadata = {
  title: "Structured Data / Schema Analyzer — JSON-LD Checker",
  description:
    "Check a page's Schema.org structured data. Detect Product, Organization, LocalBusiness, and other JSON-LD types, with suggested markup for what's missing.",
  alternates: { canonical: "/schema-analyzer" },
};

export default function SchemaAnalyzerPage() {
  return (
    <SeoLandingTemplate
      path="/schema-analyzer"
      h1="Schema Analyzer"
      intro="Structured data (JSON-LD) helps search engines and AI systems understand exactly what a page represents — a product, an article, a local business, and more. Check what's present and what's missing."
      sections={[
        {
          heading: "What we detect",
          body: "JSON-LD blocks are parsed and checked for common Schema.org types: Organization, Product, Offer, Article, BreadcrumbList, LocalBusiness, WebSite, WebPage, and others. Each is flagged as present and well-formed, present but possibly incomplete, or missing.",
        },
        {
          heading: "We don't claim official validation",
          body: "This check looks for plausible, well-structured markup — it does not submit your page to Google for official rich-result validation. For that, use Google's own testing tools alongside this audit.",
        },
        {
          heading: "A note on FAQ markup",
          body: "Google discontinued the FAQ rich-result feature in most search results in 2026. We don't recommend adding FAQPage markup purely to try to earn that rich result — but clearly structured question-and-answer content can still help readers and AI systems, independent of rich results.",
        },
      ]}
    />
  );
}
