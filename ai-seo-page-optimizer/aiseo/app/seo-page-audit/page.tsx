import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/SeoLandingTemplate";

export const metadata: Metadata = {
  title: "SEO Page Audit — Free Webpage SEO Checker",
  description:
    "Run a free SEO page audit on any public URL. Check titles, meta descriptions, headings, structured data, and content coverage — then get clear fixes.",
  alternates: { canonical: "/seo-page-audit" },
};

export default function SeoPageAuditPage() {
  return (
    <SeoLandingTemplate
      path="/seo-page-audit"
      h1="SEO Page Audit"
      intro="Check any public webpage against the on-page SEO factors that matter most — title tags, meta descriptions, canonical tags, indexability, and content depth — and get a prioritized list of fixes."
      sections={[
        {
          heading: "What a page-level SEO audit checks",
          body: "A page audit looks at the elements search engines use to understand and rank a specific page: the title tag, meta description, canonical URL, heading structure, structured data, and the depth of the visible content. It's different from a full site crawl, which looks at architecture across many pages.",
        },
        {
          heading: "Why audit one page at a time",
          body: "Most SEO work happens page by page: a product listing, a landing page, or a blog post that isn't performing. A focused single-page audit gives you a fast, actionable answer for exactly the page you're working on, without waiting on a full-site crawl.",
        },
        {
          heading: "What you'll get",
          body: "A Page Optimization Score, a breakdown across technical SEO, content, headings, and structured data, and a ranked list of the highest-impact fixes — each with why it matters and exactly what to change.",
        },
      ]}
    />
  );
}
