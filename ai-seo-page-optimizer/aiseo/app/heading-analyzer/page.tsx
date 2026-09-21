import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/SeoLandingTemplate";

export const metadata: Metadata = {
  title: "Heading Structure Checker — H1, H2, H3 Analyzer",
  description:
    "Check your page's H1, H2, and H3 heading structure. Spot missing H1s, skipped levels, and duplicate headings, and get a recommended outline.",
  alternates: { canonical: "/heading-analyzer" },
};

export default function HeadingAnalyzerPage() {
  return (
    <SeoLandingTemplate
      path="/heading-analyzer"
      h1="Heading Structure Checker"
      intro="A clear H1–H6 hierarchy helps both readers and search engines understand how your content is organized. Check your current structure against a recommended outline in seconds."
      sections={[
        {
          heading: "What a heading check looks for",
          body: "Whether the page has exactly one H1, whether heading levels are used in order without skipping (H1 → H2 → H3, not H1 → H3), whether headings are empty or duplicated, and whether the H1 length is reasonable.",
        },
        {
          heading: "Why heading structure matters",
          body: "Headings are one of the clearest structural signals on a page — used by screen readers, search engines, and AI systems alike to understand the outline of your content and to locate a specific answer within it.",
        },
        {
          heading: "What you'll get",
          body: "A side-by-side view of your current heading outline and a recommended structure, with a one-click copy button so you can apply the changes directly.",
        },
      ]}
    />
  );
}
