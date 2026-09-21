import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/SeoLandingTemplate";

export const metadata: Metadata = {
  title: "Product Page SEO Checker — Ecommerce Page Optimizer",
  description:
    "Analyze an ecommerce product page for SEO and AI Search readiness. Check Product schema, pricing clarity, specifications, and buying-decision content.",
  alternates: { canonical: "/product-page-optimizer" },
};

export default function ProductPageOptimizerPage() {
  return (
    <SeoLandingTemplate
      path="/product-page-optimizer"
      h1="Product Page Optimizer"
      intro="Product pages have their own optimization needs: clear pricing, accurate availability, complete specifications, and structured data that shopping features and AI systems can read reliably."
      sections={[
        {
          heading: "Automatic product page detection",
          body: "When a URL looks like a product page — based on Product schema or signals like pricing and add-to-cart language — a dedicated Product SEO Mode activates, checking for the fields shoppers and search engines expect.",
        },
        {
          heading: "What's checked on a product page",
          body: "Product name, brand, price, currency, availability, SKU, and description are extracted where present. We also check for Product, Offer, and AggregateRating structured data, and flag when key buying-decision information (like price or availability) is unclear in the visible content.",
        },
        {
          heading: "What we won't do",
          body: "We never suggest fabricating reviews or ratings, and we don't recommend keyword-stuffed descriptions. Structured data recommendations only ever reflect real information already on the page or ones you provide.",
        },
      ]}
    />
  );
}
