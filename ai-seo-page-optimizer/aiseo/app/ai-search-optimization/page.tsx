import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/SeoLandingTemplate";

export const metadata: Metadata = {
  title: "AI Search Optimization Tool — GEO Readiness Checker",
  description:
    "Check how ready your page is for AI Search and generative engines. Get a heuristic AI Search Readiness score plus content structure recommendations.",
  alternates: { canonical: "/ai-search-optimization" },
};

export default function AiSearchOptimizationPage() {
  return (
    <SeoLandingTemplate
      path="/ai-search-optimization"
      h1="AI Search Optimization"
      intro="AI Search optimization (sometimes called GEO, or generative engine optimization) is about structuring content so it's easier for AI systems to interpret, extract, and reference — alongside, not instead of, traditional SEO."
      sections={[
        {
          heading: "What AI Search readiness actually means",
          body: "AI systems tend to favor content that clearly and concisely answers specific questions, names key facts plainly, and organizes information into scannable sections. AI Search readiness measures how well a page does this, as an internal heuristic — not a guarantee of appearing in any AI-generated answer.",
        },
        {
          heading: "How this differs from traditional SEO",
          body: "Traditional SEO focuses heavily on ranking signals for search engine results pages. AI Search optimization adds a layer: does the content directly answer the questions a person (or an AI system on their behalf) is likely to ask? Both matter, and most of the underlying practices — clear structure, real information, accurate facts — reinforce each other.",
        },
        {
          heading: "What we check",
          body: "Likely questions related to your page's topic, whether each is covered, partially covered, or missing; key entities mentioned on the page; and whether information is presented in short, clearly structured, extractable sections.",
        },
      ]}
    />
  );
}
