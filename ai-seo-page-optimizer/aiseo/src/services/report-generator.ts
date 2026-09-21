import { crawlPage } from "@/src/services/crawler";
import { parseHtml } from "@/src/services/html-parser";
import { detectPageType } from "@/src/services/page-type-detector";
import {
  analyzeTechnicalSeo,
  analyzeHeadings,
  analyzeImages,
  analyzeInternalLinks,
} from "@/src/services/seo-analyzer";
import { analyzeContent } from "@/src/services/content-analyzer";
import { analyzeSchema } from "@/src/services/schema-analyzer";
import { analyzeAiSearchReadiness } from "@/src/services/geo-analyzer";
import { runAiAnalysis } from "@/src/services/ai-analyzer";
import { consolidateAndRank, topPriorityFixes } from "@/src/services/recommendation-engine";
import { computeScoreBreakdown } from "@/src/services/scoring-engine";
import type { AnalysisReport, Issue, MetaSuggestion, ParsedPage, PageType } from "@/src/types/analysis";
import { truncate } from "@/src/lib/utils";

export async function generateReport(inputUrl: string): Promise<AnalysisReport> {
  const crawl = await crawlPage(inputUrl);
  const page = parseHtml(crawl.html, crawl.finalUrl);
  const pageType = detectPageType(page);

  const technicalResult = analyzeTechnicalSeo(page, crawl.finalUrl);
  const headingResult = analyzeHeadings(page, page.title);
  const imagesResult = analyzeImages(page);
  const internalLinksResult = analyzeInternalLinks(page);
  const contentResult = analyzeContent(page, pageType);
  const schemaResult = analyzeSchema(page, pageType);
  const heuristicGeo = analyzeAiSearchReadiness(page, pageType);

  const ai = await runAiAnalysis(page, pageType);
  const aiSearch = ai.available && ai.output
    ? {
        score: ai.output.aiSearchScore,
        disclaimer: heuristicGeo.disclaimer,
        answerReadinessNote: heuristicGeo.answerReadinessNote,
        questions: ai.output.questions,
        entityCoverage: ai.output.entities.map((e) => ({ entity: e.entity, covered: e.covered })),
        extractabilityNote: heuristicGeo.extractabilityNote,
        source: "ai_enhanced" as const,
      }
    : heuristicGeo;

  const contentScore = ai.available && ai.output ? ai.output.contentScore : contentResult.content.score;
  const contentGaps =
    ai.available && ai.output && ai.output.contentGaps.length > 0
      ? ai.output.contentGaps
      : contentResult.content.contentGaps;

  const aiIssues: Issue[] =
    ai.available && ai.output
      ? ai.output.recommendations.map((r, i) => ({
          id: `ai-issue-${i}-${Date.now()}`,
          severity: r.severity,
          category: "ai_search" as const,
          title: r.title,
          whyItMatters: r.whyItMatters,
          currentState: "Identified by AI-enhanced content analysis.",
          recommendation: r.recommendation,
          impact: r.severity === "critical" || r.severity === "high" ? "high" : "medium",
          effort: "medium",
        }))
      : [];

  const scores = computeScoreBreakdown({
    technicalSeo: technicalResult.technical.score,
    contentCoverage: contentScore,
    headingStructure: headingResult.score,
    structuredData: schemaResult.schema.hasAnyJsonLd || schemaResult.schema.detectedTypes.length > 0
      ? computeSchemaScoreFallback(schemaResult.schema.hasAnyJsonLd, schemaResult.issues.length)
      : 30,
    aiSearchReadiness: aiSearch.score,
    internalLinking: internalLinksResult.score,
  });

  const allIssues = consolidateAndRank([
    technicalResult.issues,
    headingResult.issues,
    imagesResult.images.issues,
    contentResult.issues,
    schemaResult.issues,
    aiIssues,
  ]);

  const meta = buildMetaSuggestions(page, pageType);

  return {
    url: inputUrl,
    finalUrl: crawl.finalUrl,
    pageTitle: page.title,
    pageType,
    analyzedAt: crawl.fetchedAt,
    scores,
    technical: technicalResult.technical,
    heading: headingResult.heading,
    content: { ...contentResult.content, score: contentScore, contentGaps },
    schema: schemaResult.schema,
    aiSearch,
    internalLinks: internalLinksResult.internalLinks,
    images: imagesResult.images,
    meta,
    topPriorityFixes: topPriorityFixes(allIssues, 5),
    allIssues,
    performance: {
      measured: false,
      note: "Connect a performance data source to run a full Core Web Vitals analysis.",
    },
    productData: schemaResult.productData,
    localBusinessData: schemaResult.localBusinessData,
    singlePageModeNote:
      "This report reflects a single-page audit. A full-site audit (internal linking opportunities, competitor comparison, and site-wide patterns) is planned for a future release.",
    aiEnhanced: ai.available,
  };
}

function computeSchemaScoreFallback(hasAny: boolean, issueCount: number): number {
  let score = hasAny ? 70 : 35;
  score -= issueCount * 8;
  return Math.max(0, Math.min(100, score));
}

function buildMetaSuggestions(page: ParsedPage, pageType: PageType): MetaSuggestion {
  const h1 = page.headings.find((h) => h.level === 1)?.text;
  const subject = h1 || page.title || "your page's main topic";

  const recommendedTitle = page.title && page.title.length >= 15 && page.title.length <= 65
    ? page.title
    : truncate(`${subject} | Clear, Specific Primary Topic`, 60);

  const typeHint =
    pageType === "product"
      ? "Learn key details, pricing, and features."
      : pageType === "local_business"
      ? "Find hours, location, and services."
      : pageType === "article"
      ? "Get a clear answer and the key details."
      : "Get the details you need, clearly explained.";

  const recommendedDescription =
    page.metaDescription && page.metaDescription.length >= 60 && page.metaDescription.length <= 165
      ? page.metaDescription
      : truncate(`${subject}. ${typeHint}`, 155);

  return {
    currentTitle: page.title,
    recommendedTitle,
    currentDescription: page.metaDescription,
    recommendedDescription,
  };
}
