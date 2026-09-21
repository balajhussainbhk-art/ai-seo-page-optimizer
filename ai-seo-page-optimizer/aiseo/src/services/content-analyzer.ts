import type { ParsedPage, Issue, ContentReport, PageType } from "@/src/types/analysis";
import { clamp } from "@/src/lib/utils";

let issueCounter = 0;
function makeIssue(issue: Omit<Issue, "id">): Issue {
  issueCounter += 1;
  return { id: `content-issue-${issueCounter}-${Date.now()}`, ...issue };
}

export interface ContentAnalysisResult {
  content: ContentReport;
  issues: Issue[];
}

/**
 * Heuristic content-depth analysis. Word count is only one signal among
 * several — the goal is to flag when a page likely lacks information a
 * user would need, not to enforce an arbitrary length.
 */
export function analyzeContent(page: ParsedPage, pageType: PageType): ContentAnalysisResult {
  const issues: Issue[] = [];
  const notes: string[] = [];
  const contentGaps: string[] = [];

  const wordCount = page.wordCount;
  const paragraphCount = page.paragraphs.length;
  const hasLists = page.listItems.length > 0;
  const avgParagraphLength =
    paragraphCount > 0 ? page.paragraphs.reduce((a, p) => a + p.split(" ").length, 0) / paragraphCount : 0;

  if (wordCount < 100) {
    issues.push(
      makeIssue({
        severity: "high",
        category: "content",
        title: "Very little visible content",
        whyItMatters:
          "A page with very little text usually can't fully answer a visitor's question, and gives search engines and AI systems little to work with.",
        currentState: `Only ${wordCount} words of visible text were found.`,
        recommendation:
          "Add the missing information users would need to make a decision — not filler text, but concrete details relevant to the topic.",
        impact: "high",
        effort: "high",
      })
    );
    contentGaps.push("Core explanatory content for the page's main topic");
  } else if (wordCount < 250) {
    notes.push("Content is on the thin side for a page meant to fully answer user questions.");
  }

  if (paragraphCount > 3 && avgParagraphLength > 120) {
    issues.push(
      makeIssue({
        severity: "low",
        category: "content",
        title: "Long, dense paragraphs",
        whyItMatters:
          "Very long paragraphs are harder for users to scan and harder for AI systems to extract a specific answer from.",
        currentState: `Average paragraph length is roughly ${Math.round(avgParagraphLength)} words.`,
        recommendation: "Break long paragraphs into shorter ones, and use lists for sequential or comparative information.",
        impact: "low",
        effort: "medium",
      })
    );
  }

  if (!hasLists && wordCount > 400) {
    notes.push("No bulleted or numbered lists were found — lists often make specifications, steps, or features easier to scan and extract.");
  }

  // Page-type specific content gap hints (paired with GEO question coverage).
  if (pageType === "product") {
    contentGaps.push("Clear pricing and availability information", "Concrete product specifications or features");
  } else if (pageType === "local_business") {
    contentGaps.push("Business hours and location details", "Services offered");
  } else if (pageType === "article") {
    contentGaps.push("A clear summary or direct answer near the top of the article");
  }

  const severityPenalty = { critical: 40, high: 25, medium: 12, low: 5 } as const;
  let score = 100;
  for (const issue of issues) score -= severityPenalty[issue.severity];
  if (wordCount >= 250 && wordCount < 400) score -= 5;
  score = clamp(score, 0, 100);

  return {
    content: { wordCount, score, contentGaps, notes },
    issues,
  };
}
